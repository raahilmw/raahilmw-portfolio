"""Check published HTML policy, canonical URLs, and local script integrity."""
from base64 import b64encode
from hashlib import sha384
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import os

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = os.environ.get('SITE_ORIGIN', 'https://raahilmw.com').rstrip('/')


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.scripts = []
        self.inline = []
        self.policy = ''
        self.canonical = ''
        self.in_script = False
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script':
            self.scripts.append(attrs)
            self.in_script = not attrs.get('src')
            if self.in_script:
                self.inline.append('')
        if tag == 'meta' and attrs.get('http-equiv') == 'Content-Security-Policy':
            self.policy = attrs['content']
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs['href']

    def handle_endtag(self, tag):
        if tag == 'script':
            self.in_script = False

    def handle_data(self, data):
        if self.in_script:
            self.inline[-1] += data


def integrity(data):
    return 'sha384-' + b64encode(sha384(data).digest()).decode()


pages = sorted((ROOT / 'dist').rglob('index.html'))
assert len(pages) == 8
for file in pages:
    relative = file.relative_to(ROOT / 'dist')
    page = Page(file.read_text())
    route = relative.as_posix().removesuffix('index.html')
    assert page.canonical == f'{ORIGIN}/{route}', file
    directives = {entry.strip().partition(' ')[0]: entry.strip().partition(' ')[2] for entry in page.policy.split(';') if entry.strip()}
    for name, value in [('default-src', "'none'"), ('base-uri', "'none'"), ('object-src', "'none'"), ('script-src-attr', "'none'")]:
        assert directives[name] == value, (file, name)
    assert "'unsafe-inline'" not in directives['script-src']
    assert "'unsafe-eval'" not in directives['script-src']
    for code in page.inline:
        assert f"'{integrity(code.encode())}'" in directives['script-src'].split(), file
    for script in page.scripts:
        if 'src' in script:
            source = urlsplit(script['src'])
            assert not source.scheme and not source.netloc and source.path.startswith('/'), file
            data = (ROOT / 'dist' / source.path[1:]).read_bytes()
            assert script.get('integrity') == integrity(data), (file, source.path)
            assert script.get('crossorigin') == 'anonymous', file
    assert file.read_bytes() == (ROOT / 'docs' / relative).read_bytes(), file

for root in ('dist', 'docs'):
    for removed in ('three.module.min.js', 'scrollcraft.js'):
        assert not (ROOT / root / 'assets' / removed).exists()
print('8 routes passed canonical, CSP hash, SRI, and publication consistency checks.')
