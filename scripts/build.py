from pathlib import Path
from hashlib import sha256
from html import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
ORIGIN = 'https://raahilmw-security-lab.team-8535.chatgpt.site'
MEDIUM = 'https://medium.com/@raahil.mw'
REPORT = MEDIUM + '/how-i-got-paid-for-turning-an-image-fetcher-into-an-arbitrary-file-read-0d15679bae00'
ARTICLE = '/writeups/image-fetcher-local-file-read/'
NAV = [('Home','/'),('About','/about/'),('Writeups','/writeups/'),('Projects','/projects/'),('Certifications','/certifications/'),('Contact','/contact/')]

ICONS = '''<svg class="icon-library" aria-hidden="true"><defs>
<symbol id="sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></symbol>
<symbol id="moon" viewBox="0 0 24 24"><path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/></symbol>
<symbol id="copy" viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="13" rx="1"/><path d="M16 8V4H3v12h5"/></symbol>
<symbol id="book" viewBox="0 0 24 24"><path d="M4 3h16v18H4zM8 3v18M11 8h6m-6 4h6M2 7h4m-4 5h4m-4 5h4"/></symbol>
<symbol id="code" viewBox="0 0 24 24"><path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16"/></symbol>
<symbol id="reset" viewBox="0 0 24 24"><path d="M4 4v6h6M4 10a8 8 0 1 1 1 7"/></symbol>
</defs></svg>'''

def icon(name): return f'<svg aria-hidden="true"><use href="#{name}"/></svg>'
def label(text):
    return f'<p class="eyebrow">{text}</p>'

def nav_links(active):
    return ''.join(f'<a href="{href}"' + (' aria-current="page"' if name==active else '') + f'>{name}</a>' for name,href in NAV)

def wordmark():
    return '<a class="wordmark" href="/" aria-label="raahilmw home"><span class="brand-star" aria-hidden="true">✦</span>raahilmw<span class="brand-dot">.</span></a>'

def header(active):
    return f'''<a class="skip-link" href="#content">Skip to content</a>{ICONS}
<header class="site-header shell">{wordmark()}
<nav class="desktop-nav" aria-label="Main navigation">{nav_links(active)}</nav>
<div class="header-controls"><button class="theme-toggle icon-button" type="button" aria-label="Change appearance"><span class="theme-sun">{icon('sun')}</span><span class="theme-moon">{icon('moon')}</span></button><button class="menu-toggle icon-button" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open navigation"><span></span><span></span></button></div></header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" hidden>{nav_links(active)}</nav>'''

LINKEDIN = 'https://www.linkedin.com/in/raahilmw/'
EMAIL = 'raahil.mw@gmail.com'
SOCIAL = {
    'GitHub': 'https://github.com/raahilmw',
    'LinkedIn': LINKEDIN,
    'Email': 'mailto:' + EMAIL,
    'Instagram': 'https://www.instagram.com/raahilmw_/',
    'Discord': 'https://discord.com/users/591142560802668563',
    'Hack The Box': '',
    'TryHackMe': 'https://tryhackme.com/p/raahil.mw',
    'X': '',
}

def social_link(name, compact=False):
    key = name.lower().replace(' ', '')
    target = SOCIAL[name]
    attrs = f'class="{"platform-link" if compact else "social-orb"} platform-{key}"'
    graphic = f'<img src="/assets/social/{key}.svg" alt="" width="24" height="24">'
    if compact:
        content = f'{graphic}<span>{name}</span>'
    else:
        content = f'<span class="orb-disc">{graphic}</span><span class="orb-label">{name}</span>'
    if not target:
        return f'<span {attrs} data-unlisted title="Profile not linked">{content}<small class="card-status">Not linked</small></span>'
    external = '' if target.startswith('mailto:') else ' target="_blank" rel="noreferrer"'
    return f'<a {attrs} href="{escape(target,quote=True)}"{external}>{content}</a>'

def social_deck():
    cards = ''.join(social_link(name) for name in ('GitHub','LinkedIn','Email','Instagram','Discord'))
    platforms = ''.join(social_link(name, compact=True) for name in ('Hack The Box','TryHackMe','X'))
    return f'<div class="social-set"><div class="social-orbits">{cards}</div><div class="platform-row">{platforms}</div></div>'


def footer():
    return f'''<footer class="site-footer shell">{wordmark()}<span>© Raahil Muhammad Wildan</span><a href="{MEDIUM}" target="_blank" rel="noreferrer">Medium</a><a href="/contact/">Contact</a></footer><div class="toast" role="status" aria-live="polite" id="toast"></div>'''

def asset_url(name):
    revision = sha256((OUT / name).read_bytes()).hexdigest()[:12]
    return f'/{name}?v={revision}'


def page(title,active,body,path='/',description=None):
    description = description or 'Raahil Muhammad Wildan — penetration testing, bug hunting, security automation, and published research.'
    output = OUT / path.lstrip('/') / 'index.html'
    output.parent.mkdir(parents=True,exist_ok=True)
    extra = {'Home':'<script type="module" src="/artifact.js"></script>', 'About':f'<script src="/assets/matter.min.js" defer></script><script src="{asset_url("field.js")}" defer></script>'}.get(active,'')
    profile_css = f'<link rel="stylesheet" href="{asset_url("profile.css")}">' if active in ('Home','About') else ''
    intro = '<dialog id="site-intro" aria-label="Portfolio introduction"><div class="intro-ground" aria-hidden="true"></div><div class="intro-center" aria-hidden="true"><div class="boot-layout"><div class="boot-sigil"><span class="pixel-logo"></span></div><div class="boot-console"><div class="boot-host"><i></i>raahilmw@observatory <span>/ bash</span></div><div class="boot-prompt boot-first"><b>~ $</b><samp>whoami</samp></div><div class="boot-answer">raahilmw</div><div class="boot-prompt boot-command"><b>~ $</b><samp>sudo -u raahilmw ./open</samp></div><div class="boot-response">Field notes mounted.</div><div class="boot-ready">~/portfolio $ <i></i></div></div></div></div><button class="intro-skip" type="button">Skip intro</button></dialog><script src="/intro.js"></script>'
    output.write_text(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0b111b"><meta name="color-scheme" content="dark light"><title>{escape(title)} — raahilmw</title><meta name="description" content="{escape(description,quote=True)}"><link rel="canonical" href="{ORIGIN}{path}"><script src="{asset_url('theme.js')}"></script><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/fonts.css"><link rel="stylesheet" href="{asset_url('style.css')}">{profile_css}</head><body class="page-{active.lower()}">{header(active)}{intro}<main id="content">{body}</main>{footer()}<script src="{asset_url('app.js')}" defer></script>{extra}</body></html>''')

def portrait():
    return ('<figure class="portrait"><div class="portrait-crop">'
            '<img src="/assets/raahil-pixel-portrait.webp" width="1122" height="1402" '
            'alt="Pixel portrait of Raahil adjusting his tie, with forested hills behind him.">'
            '</div><figcaption>@raahilmw</figcaption></figure>')

def article_card():
    return f'''<article class="research-card"><a class="research-cover" href="{ARTICLE}" aria-label="Read the image fetcher case study"><span class="mono">WEB SECURITY</span>
<div class="boundary-art" aria-hidden="true"><i></i><i></i><i></i><b></b><em></em></div><span class="cover-sub mono">Image fetcher / trust boundary</span></a><div class="research-copy"><div class="entry-meta"><time datetime="2026-10-07">07 Oct 2026</time><span>Case study</span></div><h3><a href="{ARTICLE}">The image fetcher that read local files.</a></h3><p>Where a backend’s idea of an image URL crossed into the server’s filesystem.</p><div class="tag-list"><span>SSRF</span><span>File read</span></div><a class="underlined" href="{ARTICLE}">Read the writeup</a></div></article>'''

home = f'''
<section class="home-hero"><div class="hero-layout shell">
<div class="hero-copy">{label('Security researcher')}<h1>Finding what<br>others <em>miss.</em></h1><p>I’m <strong>raahilmw</strong>, a penetration tester, bug hunter, and builder of security automation.</p>
<div class="hero-actions"><a class="button primary" href="/writeups/">{icon('book')}Explore my writeups</a><a class="underlined" href="/about/">About me</a></div></div>
<div class="artifact-stage" id="artifact-stage"><div class="artifact-fallback" aria-hidden="true"><i></i><i></i><i></i></div><canvas id="artifact" role="img" aria-label="A silver torus knot that dissolves into particles where you hover"></canvas>
<a class="specimen-tag tag-top" href="{ARTICLE}"><span class="tag-glyph">{icon('book')}</span><span><small>Field note</small>Local file read</span></a>
<button class="artifact-control" id="artifact-control" type="button" hidden><span aria-hidden="true">✧</span> Inspect surface</button></div>
</div><div class="hero-baseline shell"><span>@raahilmw</span><a href="#selected">Scroll to explore <span aria-hidden="true">↓</span></a></div></section>
<section class="shell home-connect" aria-labelledby="home-connect-title"><div>{label("Find me online")}<h2 id="home-connect-title">Connect.</h2></div>{social_deck()}</section>
<section class="section shell" id="selected"><div class="section-heading"><div>{label('Fieldwork')}<h2>Selected research.</h2></div><a class="underlined" href="/writeups/">All writeups</a></div>{article_card()}</section>
<section class="section shell practice"><div>{label('About the researcher')}<h2>Hi, I’m Raahil.</h2><p>I look at the assumptions people build into web applications and APIs. When a test starts to repeat itself, I turn it into a tool.</p><a class="underlined" href="/about/">More about me</a></div><div class="practice-list"><a href="/writeups/">Penetration testing</a><a href="{ARTICLE}">Bug hunting</a><a href="/projects/">Security automation</a></div></section>'''
page('Security research','Home',home)

tiles = [
    ('Penetration testing','scan',-5), ('IDOR','bug',7), ('APIs','brackets',-4),
    ('Burp Suite','tool',5), ('Web security','web',-4), ('Dalfox','tool',-7),
    ('Trust boundaries','bounds',4), ('XSS','bug',-6), ('Python','brackets',5),
    ('Networking','bounds',-4), ('VAPT','scan',6), ('Nuclei','tool',-5),
    ('Automation','flow',3), ('HTTP','note',6), ('SSRF','bug',-3),
    ('Bug hunting','web',5), ('Nmap','tool',-4), ('Field notes','note',5),
    ('OWASP','bounds',-6), ('Research','scan',3), ('Access control','brackets',-3),
]
glyph = {'scan':'⌖','bug':'✳','brackets':'{ }','flow':'⌁','web':'◎','bounds':'⌗','note':'≡','tool':'⌘'}

def tile(entry):
    text, mark, angle = entry
    return f'<button type="button" class="field-tile tile-{mark}" data-angle="{angle}" aria-describedby="field-keys"><span aria-hidden="true">{glyph[mark]}</span>{text}</button>'

# Dates and roles are from the owner's public LinkedIn profile.
roles = [
    ('Dec 2023 – May 2024','Data Center Engineering Intern','PT Usaha Adi Sanggoro (ASNET)'),
    ('From Jul 2026','Penetration Testing Intern','JAH Training Center'),
    ('From Sep 2026','Offensive Security Intern','VINIX7'),
]
# Three small pixel stamps cut on a common 16 by 16 grid.
expertise = [
    ('Penetration Testing', 'scope', [
        '      ####', '       ##', '    ########', '   ##  ##  ##', '  ##        ##',
        '  #    ##    #', '###### ## ######', '###### ## ######', '  #    ##    #',
        '  ##        ##', '   ##  ##  ##', '    ########', '       ##', '      ####']),
    ('Web Exploitation', 'web', [
        '   ##########', '  ##   ##   ##', ' ##   #  #   ##', ' ##   #  #   ##',
        ' ##############', ' ##   #  #   ##', ' ##   #', ' ##   #   ##',
        '  ########  ##', '   ##   ##    ##', '    ######  #####', '          ## ##',
        '              ##']),
    ('Security Automation', 'pulse', [
        '        #####', '       #####', '      #####', '     #####', '    #####',
        '   ##########', '  ##########', '       ####', '      ####', '     ###',
        '    ###', '   ##', '  #']),
]

def expertise_stamp(entry):
    name, motif, pixels = entry
    cells = ' '.join(f'M{x} {y}h1v1h-1z' for y, row in enumerate(pixels) for x, pixel in enumerate(row) if pixel == '#')
    art = f'<svg viewBox="-1 -1 18 17" aria-hidden="true" shape-rendering="crispEdges"><path d="{cells}"/></svg>'
    return f'<li class="stamp-{motif}"><span class="stamp-art">{art}</span><span>{name}</span></li>'

tool_names = ['Burp Suite', 'Dalfox', 'Nuclei', 'Nmap', 'Wireshark', 'Python', 'Bash']
education = [
    ('From 2024','Bachelor of Technology in Information Technology','Asia e University'),
    ('From 2024','Diploma in Informatics and Information Technology','CEP-CCIT FTUI · Cyber Security'),
]

def timeline(entries):
    items = ''.join(f'<li><span class="year">{date}</span><div><h3>{title}</h3><p>{detail}</p></div></li>' for date, title, detail in entries)
    return f'<ol class="career-track">{items}</ol>'

about_parts = [('about-me','About me'),('expertise','Expertise'),('tools','Tools'),('experience','Experience'),('education','Education'),('connect','Connect')]
index_links = ''.join(f'<a href="#{anchor}">{escape(name)}</a>' for anchor,name in about_parts)
about = f'''
<section class="field-scroll" aria-label="Interactive research interests"><div class="field-sticky"><div class="field-card"><div class="field-board">
{''.join(map(tile,tiles))}</div><div class="field-caption"><p>Grab and toss a tile. Scroll to let it fall.</p><span class="sr-only" id="field-keys">Use the arrow keys to move a focused tile.</span></div>
</div></div></section>
<section id="about-me" class="shell about-profile">{portrait()}<div class="bio">{label('About me')}<h1>Raahil Muhammad<br>Wildan<span class="red">.</span></h1>
<p class="bio-lead">I’m a cybersecurity student in Tangerang Selatan, Indonesia. I test web applications and APIs, and I’m especially interested in what happens when a request reaches the wrong part of a system.</p>
<p>Before I started hunting bugs, I worked in a data center and taught routing. I still think in terms of a request’s journey. Where does it go? Which service decides what the user can see? If I find myself checking the same thing twice, I’ll usually write a small tool for it.</p>
<p>One bug I reported started with a feature that fetched pictures. It turned out the server could read a local file, too. My writeup walks through how I confirmed the impact and what the team could change to prevent it.</p>
<div class="profile-actions"><button type="button" class="contact-action copy-action" data-copy="{EMAIL}" data-message="Email copied." aria-label="Copy email address {EMAIL}"><span class="copy-emblem">{icon('copy')}</span><span>Copy email</span></button></div></div></section>
<div class="shell about-index-layout"><nav class="about-index" aria-label="On this page">{label('On this page')}{index_links}</nav>
<div class="about-chapters">
<section id="expertise" class="about-chapter"><h2>Expertise</h2><ul class="expertise-list">{''.join(map(expertise_stamp, expertise))}</ul></section>
<section id="tools" class="about-chapter"><h2>Tools</h2><ul class="tool-list">{''.join(f'<li>{name}</li>' for name in tool_names)}</ul></section>
<section id="experience" class="about-chapter"><h2>Experience</h2>{timeline((date, org, role) for date, role, org in roles)}</section>
<section id="education" class="about-chapter"><h2>Education</h2>{timeline(education)}</section>
<section id="connect" class="about-chapter"><h2>Let’s connect.</h2>{social_deck()}</section></div></div>'''
page('About','About',about,'/about/')

writeups=f'''<section class="page-intro shell">{label('THE RESEARCH NOTEBOOK')}<h1>Writeups<span class="red">.</span></h1><p>Findings, the questions behind them,<br>and what the evidence actually says.</p><div class="intro-rule"><span class="mono">PUBLISHED NOTES</span><span class="mono">WEB SECURITY / INVESTIGATION / DISCLOSURE</span></div></section><section class="shell writeups-index">{article_card()}</section>'''
page('Writeups','Writeups',writeups,'/writeups/')

article_body=f'''<section class="article-header shell"><a class="underlined breadcrumb" href="/writeups/">All writeups</a>{label('FIELD NOTE / WEB SECURITY')}<h1>How I Got Paid for Turning an Image Fetcher into an Arbitrary File Read</h1><div class="article-byline"><span>By Raahil Muhammad Wildan</span><time datetime="2026-10-07">07 October 2026</time><span>Case-study summary</span></div></section><div class="shell article-layout"><aside class="article-aside"><div class="note-stamp">FIXED BEFORE<br>PUBLICATION</div><dl><dt>Class</dt><dd>SSRF / local file read</dd><dt>Surface</dt><dd>Image-to-Base64 API</dd><dt>Environment</dt><dd>Anonymized UAT</dd></dl><a class="underlined" href="{REPORT}" target="_blank" rel="noreferrer">Original report on Medium</a></aside><article class="article-body"><p class="article-lead">An image-fetching feature accepted a URL and returned Base64. Allowing a local-file scheme turned that convenience into a server-side file read.</p><h2>The boundary</h2><p>The API accepted <code>file://</code> through its image parameter. Reading harmless system-identification files confirmed that the returned data came from the application server’s filesystem.</p><h2>The filter gap</h2><p>The filter and the fetcher interpreted the same input differently. Their disagreement allowed the request to cross the intended boundary.</p><h2>Confirmed impact, stated carefully</h2><p>The confirmed result was arbitrary local file read. A configuration file produced a non-empty response; its contents were not decoded. Valid credentials, database access, and further compromise were not established.</p><h2>The lesson</h2><p>Restrict supported protocols, validate normalized destinations, repeat checks after redirects, and verify that fetched content is an image. Encoding a response does not protect its contents.</p><div class="article-disclosure"><span class="mono">DISCLOSURE NOTE</span><p>The organization is anonymized. The issue was fixed before publication.</p></div><div class="article-source"><span class="mono">FROM THE AUTHOR’S NOTEBOOK</span><p>This page is a concise companion to the original report.</p><a class="button button-red" href="{REPORT}" target="_blank" rel="noreferrer">Read the full report on Medium</a></div><div class="article-actions"><a class="underlined" href="/writeups/">Back to the notebook</a><button class="text-link" type="button" data-copy="{ORIGIN}{ARTICLE}">{icon('copy')}Copy article link</button></div></article></div>'''
page('Image fetcher to arbitrary file read','Writeups',article_body,ARTICLE,'A case-study summary by Raahil Muhammad Wildan: an image-to-Base64 endpoint, URL schemes, normalization, and confirmed local file read.')

projects=f'''<section class="page-intro shell">{label('THE WORKBENCH')}<h1>Projects<span class="red">.</span></h1><p>Small experiments, useful tools,<br>and ideas put into practice.</p><div class="intro-rule"><span class="mono">TOOLS &amp; EXPERIMENTS</span><span class="mono">BUILD / OBSERVE / REFINE</span></div></section><section class="shell projects-index"><article class="project-feature"><div class="project-art" aria-hidden="true"><span class="mono">WORKFLOW / A SMALL EXPERIMENT</span><div class="project-flow"><span>MAP</span><i></i><span>PROBE</span><i></i><span>CONNECT</span><i></i><span>REPORT</span></div><span class="handwritten">make room for human judgment.</span></div><div class="project-copy"><span class="eyebrow">PORTFOLIO EXPERIMENT</span><h2>A workflow,<br>made visible.</h2><p>An interactive browser-only demonstration of a recon pipeline. Sample data shows how a sequence of steps becomes a readable investigation queue.</p><div class="tag-list"><span>Interactive demo</span><span>Automation</span></div><a class="button" href="/projects/recon-workflow/">Open the experiment</a></div></article></section>'''
page('Projects','Projects',projects,'/projects/')

workflow=f'''<section class="page-intro shell narrow-intro"><a class="underlined breadcrumb" href="/projects/">All projects</a>{label('PORTFOLIO EXPERIMENT')}<h1>From noise<br>to signal<span class="red">.</span></h1><p>A small look at a repeatable recon workflow.</p></section><section class="shell workflow-page"><div class="workflow-intro"><p>This demonstration uses sample data in your browser. It makes no network requests and scans no targets.</p><button class="button button-red" id="run-workflow" type="button">Run the workflow</button></div><div class="workflow-notebook"><div class="notebook-heading"><span class="mono">RECON.WORKFLOW</span><span class="mono">ILLUSTRATIVE PYTHON</span></div><pre class="workflow-code"><code><span class="code-muted">from</span> curiosity <span class="code-muted">import</span> Workflow

scope = <span class="red">"example.test"</span>
recon = Workflow(scope)
<span data-step="0">recon.map_surface()</span>
<span data-step="1">recon.probe_services()</span>
<span data-step="2">recon.connect_signals()</span>
<span data-step="3">recon.export_findings()</span></code></pre><div id="workflow-output" role="status" aria-live="polite">Ready when curiosity calls.</div><ol class="workflow-track" aria-label="Workflow stages"><li data-track="0">Map</li><li data-track="1">Probe</li><li data-track="2">Connect</li><li data-track="3">Report</li></ol></div></section>'''
page('Recon workflow','Projects',workflow,'/projects/recon-workflow/')

certs=f'''<section class="page-intro shell">{label('LEARNING / ON THE RECORD')}<h1>Certifications<span class="red">.</span></h1><p>A place for qualifications,<br>with a way to verify them.</p><div class="intro-rule"><span class="mono">CREDENTIAL RECORD</span><span class="mono">ISSUER / QUALIFICATION / VERIFICATION</span></div></section><section class="shell certifications-index"><div class="empty-record"><span class="empty-record-mark" aria-hidden="true">+</span><h2>No certifications listed yet.</h2><p>Published credentials and their verification links will appear here.</p><a class="underlined" href="/about/">Explore my research practice</a></div></section>'''
page('Certifications','Certifications',certs,'/certifications/')

contact=f'''<section class="contact-page shell">{label('OPEN A CONVERSATION')}<h1>Let’s compare<br>notes<span class="red">.</span></h1><p class="contact-intro">Security research, interesting systems,<br>and questions worth following.</p><div class="contact-records"><div class="contact-record"><span class="mono">EMAIL</span><div><strong><a href="mailto:{EMAIL}">{EMAIL}</a></strong></div><button class="button" type="button" data-copy="{EMAIL}" data-message="Email copied.">{icon('copy')}Copy email</button></div><div class="contact-record"><span class="mono">THE HANDLE</span><div><strong>@raahilmw</strong><span>The handle I use for security research.</span></div><button class="button" type="button" data-copy="raahilmw">{icon('copy')}Copy handle</button></div><div class="contact-record"><span class="mono">THE WRITING</span><div><strong>Medium</strong><span>Published research and the full field notes.</span></div><a class="button" href="{MEDIUM}" target="_blank" rel="noreferrer">Visit my Medium</a></div></div></section>'''
page('Contact','Contact',contact,'/contact/')
print('Built 8 portfolio pages.')
