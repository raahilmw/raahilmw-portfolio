from pathlib import Path
from hashlib import sha256
from functools import lru_cache
from html import escape
from calendar import month_name
import os

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
ORIGIN = os.environ.get('SITE_ORIGIN', 'https://raahilmw-security-lab.team-8535.chatgpt.site').rstrip('/')
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
<div class="header-controls"><button class="theme-toggle icon-button" type="button" aria-label="Change appearance"><span class="theme-sun">{icon('sun')}</span><span class="theme-moon">{icon('moon')}</span></button><button class="menu-toggle icon-button" type="button" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open navigation"><svg class="menu-signal" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 12 Q16 12 27 12"/><path d="M5 20 Q16 20 27 20"/></svg></button></div></header>
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
    return f'''<footer class="site-footer shell">{wordmark()}<span>2026 raahilmw</span><a href="{MEDIUM}" target="_blank" rel="noreferrer">Medium</a><a href="/contact/">Contact</a><button type="button" class="replay-arrival" aria-label="Replay opening animation"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v6h6M4 10a8 8 0 1 1 1 7"/></svg><span>Replay arrival</span></button></footer><div class="toast" role="status" aria-live="polite" id="toast"></div>'''

@lru_cache(maxsize=None)
def asset_url(name):
    revision = sha256((OUT / name).read_bytes()).hexdigest()[:12]
    return f'/{name}?v={revision}'


def page(title,active,body,path='/',description=None):
    description = description or 'Raahil Muhammad Wildan — penetration testing, bug hunting, security automation, and published research.'
    output = OUT / path.lstrip('/') / 'index.html'
    output.parent.mkdir(parents=True,exist_ok=True)
    extra = {'Home':f'<script defer src="{asset_url("inspection-lens.js")}"></script>', 'About':f'<script src="/assets/matter.min.js" defer></script><script src="{asset_url("field.js")}" defer></script><script src="{asset_url("portrait-motion.js")}" defer></script>'}.get(active,'')
    if active == 'Home':
        extra += f'<script defer src="{asset_url("research-map.js")}"></script>'
    if active == 'Contact':
        extra += f'<script defer src="{asset_url("contact.js")}"></script>'
    if active == 'Certifications':
        extra += f'<script defer src="{asset_url("certifications.js")}"></script>'
    if path == ARTICLE:
        extra += f'<script defer src="{asset_url("case-study.js")}"></script>'
    case_css = f'<link rel="stylesheet" href="{asset_url("case-study.css")}">' if path == ARTICLE else ''
    certificate_css = f'<link rel="stylesheet" href="{asset_url("certifications.css")}">' if active == 'Certifications' else ''
    contact_css = f'<link rel="stylesheet" href="{asset_url("contact.css")}">' if active == 'Contact' else ''
    profile_css = f'<link rel="stylesheet" href="{asset_url("profile.css")}">' if active in ('Home','About','Contact') else ''
    home_css = f'<link rel="stylesheet" href="{asset_url("inspection-lens.css")}">' if active == 'Home' else ''
    intro = f'''<dialog id="site-intro" aria-label="Portfolio introduction">
<div class="identity-frame" aria-hidden="true"><span>raahilmw<span class="identity-period">.</span></span><span class="identity-state">Reading signature</span></div>
<div class="identity-stage" aria-hidden="true">
  <div class="identity-reader"><div class="identity-glass"><i class="identity-ghost"></i><i class="identity-print"></i><i class="identity-beam"></i></div><i class="reader-corner"></i><i class="reader-corner"></i></div>
  <div class="intro-terminal">
    <div class="terminal-title"><b>raahilmw@observatory</b><span>/ bash</span></div>
    <div class="terminal-session">
      <div class="terminal-command command-one"><i>~ $</i> whoami</div>
      <div class="terminal-output output-one">raahilmw</div>
      <div class="terminal-command command-two"><i>~ $</i> sudo -u raahilmw ./open</div>
      <div class="terminal-output output-two">Field notes mounted.</div>
      <div class="terminal-ready">~/portfolio $ <i></i></div>
    </div>
  </div>
</div>
<div class="identity-footer"><button class="intro-skip" type="button" autofocus>Skip intro <kbd>Esc</kbd></button><div class="identity-meter" aria-hidden="true"><i></i></div></div>
</dialog><script defer src="{asset_url('intro.js')}"></script>'''
    output.write_text(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0b111b"><meta name="color-scheme" content="dark light"><title>{escape(title)} — raahilmw</title><meta name="description" content="{escape(description,quote=True)}"><link rel="canonical" href="{ORIGIN}{path}"><script src="{asset_url('theme.js')}"></script><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="{asset_url('assets/fonts.css')}"><link rel="stylesheet" href="{asset_url('style.css')}">{profile_css}<link rel="stylesheet" href="{asset_url('motion.css')}">{contact_css}{certificate_css}{case_css}{home_css}</head><body class="page-{active.lower()}">{header(active)}{intro}<main id="content">{body}</main>{footer()}<script src="{asset_url('app.js')}" defer></script><script src="{asset_url('motion.js')}" defer></script>{extra}</body></html>''')

def portrait():
    photo = 'assets/raahil-portrait.webp'
    if not (OUT / photo).exists():
        return ''
    return f'''<figure class="researcher-print">
      <div class="print-scene">
        <div class="print-back" aria-hidden="true"></div>
        <div class="print-landscape" aria-hidden="true"><div class="forest-ink"></div></div>
        <div class="print-contour" aria-hidden="true"></div>
        <div class="print-figure"><img src="{asset_url(photo)}" width="800" height="1000" alt="Raahil Muhammad Wildan adjusting his tie." loading="lazy" decoding="async"></div>
      </div>
      <figcaption><span>@raahilmw</span><i aria-hidden="true"></i><span>Tangerang Selatan, Indonesia</span></figcaption>
    </figure>'''

def article_card():
    return f'''<article class="research-card"><a class="research-cover" href="{ARTICLE}" aria-label="Read the image fetcher case study"><span class="mono">WEB SECURITY</span>
<div class="boundary-art" aria-hidden="true"><i></i><i></i><i></i><b></b><em></em></div><span class="cover-sub mono">Image fetcher / trust boundary</span></a><div class="research-copy"><div class="entry-meta"><time datetime="2026-10-07">07 Oct 2026</time><span>Case study</span></div><h3><a href="{ARTICLE}">The image fetcher that read local files.</a></h3><p>An image URL parameter accepted file URLs and returned local server files as Base64.</p><div class="tag-list"><span>SSRF</span><span>File read</span></div><a class="underlined" href="{ARTICLE}">Read the writeup</a></div></article>'''

def research_map():
    trail = 'M-16 216 C30 218 30 168 75 168 S136 166 146 128 S157 68 208 68 S260 101 255 131 S260 188 312 188 S395 172 436 141 S487 125 520 132'
    links = [
        ('testing', 'Penetration testing', '/writeups/'),
        ('hunting', 'Bug hunting', ARTICLE),
        ('automation', 'Security automation', '/projects/'),
    ]
    points = ''.join(f'<a class="map-point map-{key}" href="{href}"><i aria-hidden="true"></i><span>{name}</span></a>' for key,name,href in links)
    return f'''<nav class="research-map" aria-label="Explore my research">
    <div class="map-contours" aria-hidden="true"></div>
    <svg class="map-trail" viewBox="0 0 500 262" preserveAspectRatio="none" aria-hidden="true">
      <path class="trail-guide" d="{trail}"/><path class="trail-ink" pathLength="1" d="{trail}"/>
    </svg>{points}</nav>'''

def inspection_lens():
    # Both films use the same records so the magnified view stays registered.
    roles = ('user', 'admin', 'user')
    rows = ''.join(
        f'<div class="sample-row"><span class="sample-route"><b>GET</b> /profile</span>'
        f'<span class="sample-value">role={role}</span><span class="sample-status">200</span></div>'
        for role in roles
    )
    controls = []
    for i, role in enumerate(roles):
        checked = ' checked' if i == 1 else ''
        controls.append(
            f'<label class="focus-stop" title="Focus on request {i+1}">'
            f'<input type="radio" name="focus-request" value="{i}"{checked} '
            f'aria-label="Request {i+1}, role {role}"><i aria-hidden="true"></i></label>'
        )
    return f'''<figure class="inspection-lens" aria-labelledby="lens-caption">
      <div class="optic-stage" role="img" aria-label="An inspection lens over three sample requests. Two have the user role. The middle one has the admin role.">
        <div class="sample-film" aria-hidden="true">{rows}</div>
        <div class="optic-refraction" aria-hidden="true"><div class="sample-film">{rows}</div></div>
        <div class="optic-loupe" aria-hidden="true">
          <div class="optic-glass"><i class="glass-sweep"></i></div>
          <img class="optic-bezel" src="{asset_url('assets/inspection-lens.webp')}" width="896" height="896" alt="" decoding="async" fetchpriority="high">
        </div>
      </div>
      <figcaption class="optic-caption">
        <span id="lens-caption">Inspection lens</span><span class="optic-ratio" aria-label="1.8 times magnification">1.8×</span>
        <span class="optic-rule" aria-hidden="true"></span>
        <span class="optic-hint" hidden><span>Move to focus</span><span>Tap a row</span></span>
        <fieldset class="focus-stops" hidden><legend class="sr-only">Focus on a sample request</legend>{''.join(controls)}</fieldset>
      </figcaption>
    </figure>'''


home = f'''
<section class="home-hero"><div class="hero-layout shell">
<div class="hero-copy"><h1><span class="hero-line">Finding what</span> <span class="hero-line">others <em>miss.</em></span></h1><p>I’m <strong>raahilmw</strong>, a penetration tester, bug hunter, and builder of security automation.</p>
<div class="hero-actions"><a class="button primary" href="/writeups/">{icon('book')}Explore my writeups</a><a class="underlined" href="/about/">About me</a></div></div>
{inspection_lens()}
</div><div class="hero-baseline shell"><span>@raahilmw</span><a class="scroll-cue" href="#selected"><i aria-hidden="true"></i>Scroll to explore</a></div></section>
<section class="shell home-connect" aria-labelledby="home-connect-title"><div><h2 id="home-connect-title">Connect.</h2></div>{social_deck()}</section>
<section class="section shell" id="selected"><div class="section-heading"><div><h2>Selected research.</h2></div><a class="underlined" href="/writeups/">All writeups</a></div>{article_card()}</section>
<section class="section shell practice"><div><h2>Hi, I’m Raahil.</h2><p>I look at the assumptions people build into web applications and APIs. When a test starts to repeat itself, I turn it into a tool.</p><a class="underlined" href="/about/">More about me</a></div>{research_map()}</section>'''
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

roles = [
    ('lintasarta', 'Lintasarta', 'IT Service Management Intern', '2023-07', '2023-11'),
    ('asnet', 'PT Usaha Adi Sanggoro (ASNET)', 'Data Center Infrastructure Engineer Intern', '2023-12', '2024-05'),
    ('jah', 'JAH Training Centre', 'Penetration Testing Intern', '2026-07', '2026-10'),
    ('vinix7', 'Vinix7', 'Cybersecurity Ethical Hacker Intern', '2026-09', '2026-12'),
    ('rework', 'ReWork Academy', 'Bootcamp CyberSecurity', '2026-10', '2026-12'),
]

education = [
    ('aeu', 'Asia e University', 'Bachelor of Information and Communication Technology (Honours)', '2024', None),
    ('cep-ccit', 'CEP-CCIT FTUI', 'Information Technology in Cyber Security\nCWAP : 3.44 (4-Scale)', '2024', '2026'),
]

def timeline_date(value):
    if value is None:
        return 'Present'
    year, _, month = value.partition('-')
    label = f'{month_name[int(month)]} {year}' if month else year
    return f'<time datetime="{value}">{label}</time>'

def timeline_row(section, entry):
    brand, organization, detail, start, end = entry
    paragraphs = ''.join(f'<p>{escape(line)}</p>' for line in detail.splitlines())
    logo = asset_url(f'assets/{section}/{brand}.webp')
    logo_detail = ''
    if brand == 'asnet':
        logo_detail = '<span class="asnet-domain">www.as.net.id</span>'
    elif brand == 'rework':
        dark_logo = asset_url('assets/experience/rework-dark.webp')
        logo_detail = f'<img class="rework-dark" src="{dark_logo}" alt="" loading="lazy" decoding="async">'
    return f'''<li>
      <span class="experience-stop" aria-hidden="true"></span>
      <button type="button" class="experience-logo" disabled aria-label="Replay {escape(organization, quote=True)} logo animation">
        <span class="logo-rim" aria-hidden="true"></span>
        <span class="logo-face logo-{brand}" aria-hidden="true"><img src="{logo}" alt="" loading="lazy" decoding="async">{logo_detail}</span>
      </button>
      <div class="experience-job"><h3>{escape(organization)}</h3>{paragraphs}</div>
      <p class="experience-dates">{timeline_date(start)} – {timeline_date(end)}</p>
    </li>'''

def timeline_section(section, title, entries):
    rows = ''.join(timeline_row(section, entry) for entry in entries)
    return f'<section id="{section}" class="about-chapter profile-timeline" aria-labelledby="{section}-title"><h2 id="{section}-title">{title}</h2><ol class="experience-list">{rows}</ol></section>'

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

about_parts = [('about-me','About me'),('expertise','Expertise'),('tools','Tools'),('experience','Experience'),('education','Education')]
index_links = ''.join(f'<a href="#{anchor}">{escape(name)}</a>' for anchor,name in about_parts)
about = f'''
<section class="field-scroll" aria-label="Interactive research interests"><div class="field-sticky"><div class="field-card"><div class="field-board">
{''.join(map(tile,tiles))}</div><div class="field-caption"><p>Grab and toss a tile. Scroll to let it fall.</p><span class="sr-only" id="field-keys">Use the arrow keys to move a focused tile.</span></div>
</div></div></section>
<section id="about-me" class="shell profile-spread" aria-labelledby="researcher-name">
{portrait()}
<div class="profile-text"><header class="profile-heading">
<h1 id="researcher-name"><span class="name-mask"><span class="name-first">Raahil</span></span> <span class="name-mask"><em class="name-last">Muhammad Wildan.</em></span></h1>
</header>
<div class="profile-prose"><p class="profile-intro">I’m a cybersecurity student and bug hunter. I test web apps and APIs, especially the places where one user’s access ends and another’s begins.</p>
<p>I got my start in a data center and taught network routing. I still like to trace a request from one system to the next. When a check keeps coming up, I write a small tool for it.</p>
<p>One report started with a feature that fetched pictures. It turned out the server could read its own files through it. I wrote up what I could verify and how the team could fix it.</p>
<div class="profile-actions"><button type="button" class="contact-action copy-action" data-copy="{EMAIL}" data-message="Email copied." aria-label="Copy email address {EMAIL}"><span class="copy-emblem">{icon('copy')}</span><span>Copy email</span></button></div></div>
</div></section>
<div class="shell about-index-layout"><nav class="about-index" aria-label="On this page">{label('On this page')}{index_links}</nav>
<div class="about-chapters">
<section id="expertise" class="about-chapter"><h2>Expertise</h2><ul class="expertise-list">{''.join(map(expertise_stamp, expertise))}</ul></section>
<section id="tools" class="about-chapter"><h2>Tools</h2><ul class="tool-list">{''.join(f'<li>{name}</li>' for name in tool_names)}</ul></section>
{timeline_section('experience', 'Experience', roles)}
{timeline_section('education', 'Education', education)}
</div></div>'''
page('About','About',about,'/about/')

writeups=f'''<section class="page-intro shell"><h1>Writeups<span class="red">.</span></h1><p>Security findings, from the first request<br>to the fix.</p></section><section class="shell writeups-index">{article_card()}</section>'''
page('Writeups','Writeups',writeups,'/writeups/')

article_body = (ROOT / 'content/writeups/image-fetcher.html').read_text().replace('{{REPORT_URL}}', REPORT).replace('{{ARTICLE_URL}}', ORIGIN + ARTICLE)
for evidence in (OUT / 'assets/writeups/image-fetcher').glob('*.png'):
    local_path = '/' + evidence.relative_to(OUT).as_posix()
    article_body = article_body.replace('"' + local_path + '"', '"' + asset_url(local_path.lstrip('/')) + '"')
page('Image fetcher to arbitrary file read','Writeups',article_body,ARTICLE,'A bug bounty writeup about an image-to-Base64 endpoint that exposed local files, with a reward response, privacy-edited screenshots, and clear reproduction notes.')

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

certificate_id = 'd508375a-3807-48d3-b0c9-8c8a8980d722'
certificate_png = '/assets/certificates/cyberops-associate.png'
certificate_pdf = '/assets/certificates/cyberops-associate.pdf'
course_skills = [
    'Data and Event Analysis', 'Security Concepts', 'Attack Methods', 'Incident Response',
    'Cryptography', 'Malware Analysis', 'Security Policy', 'Computer Forensics',
    'Security Monitoring', 'Network Attacks', 'Host-based Analysis', 'SOC Metrics',
    'Network Intrusion Analysis', 'SecOps', 'Cybersecurity', 'Endpoint Threat Analysis',
    'Security Procedures', 'Threat Detection',
]
certs=f'''<section class="page-intro shell credential-intro"><h1>Certifications<span class="red">.</span></h1><p>What I’ve learned.<br>The record behind it.</p></section>
<section class="shell certifications-index" aria-labelledby="cyberops-title">
<article class="credential-feature">
<div class="credential-visual">
<div class="credential-orbit" aria-hidden="true"><i></i><i></i><i></i></div>
<a class="certificate-preview" href="{certificate_png}" target="_blank" rel="noreferrer" data-certificate-open aria-label="Enlarge the CyberOps Associate certificate">
<img src="{asset_url('assets/certificates/cyberops-associate-preview.webp')}" width="1600" height="1084" alt="CyberOps Associate course completion certificate awarded to Raahil Muhammad Wildan on 30 October 2026." decoding="async">
<span class="certificate-loupe" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M7 10h6m-3-3v6"/></svg>View certificate</span>
</a>
<p class="credential-document"><span>Original course record</span><time datetime="2026-10-30">30 Oct 2026</time></p>
</div>
<div class="credential-copy">
<h2 id="cyberops-title">CyberOps<br> Associate<span class="red">.</span></h2>
<p class="credential-kind">Cisco Networking Academy <span>Course completion</span></p>
<p class="credential-summary">Monitoring, detecting, and responding to cyber threats. A defender’s perspective on the network and endpoint activity an attack leaves behind.</p>
<dl class="credential-facts"><div><dt>Offered by</dt><dd>Faculty of Engineering,<br>University of Indonesia</dd></div><div><dt>Instructor</dt><dd>Elvian Syafrurizal</dd></div><div><dt>Completed</dt><dd><time datetime="2026-10-30">30 October 2026</time></dd></div></dl>
<div class="credential-actions"><a class="button primary" href="{certificate_pdf}" target="_blank" rel="noreferrer">{icon('book')}View PDF</a><a class="underlined" href="{certificate_png}" download="raahilmw-cyberops-associate.png">Download PNG</a></div>
</div>
</article>
<section class="course-notes" aria-labelledby="course-notes-title">
<div class="course-overview"><h2 id="course-notes-title">About the course.</h2><p>From recognizing an attack to making sense of the evidence: security monitoring, event analysis, and incident response across hosts and networks.</p><p class="course-preparation">The course supports preparation for the Cisco Certified Cybersecurity Associate certification.</p></div>
<div class="course-focus" aria-label="Course focus"><span>Monitor<svg viewBox="0 0 44 26" aria-hidden="true"><path d="M2 15h9l4-9 8 18 6-13 4 4h9"/></svg></span><span>Detect<svg viewBox="0 0 44 26" aria-hidden="true"><circle cx="22" cy="13" r="10"/><circle cx="22" cy="13" r="4"/><path d="M22 0v6m0 14v6M9 13h6m14 0h6"/></svg></span><span>Respond<svg viewBox="0 0 44 26" aria-hidden="true"><path d="m12 4 10-3 10 3v9c0 7-10 12-10 12S12 20 12 13zM18 13l3 3 6-7"/></svg></span></div>
</section>
<details class="course-skills" open><summary>Course skills <span class="skills-chevron" aria-hidden="true"></span></summary><ul>{''.join(f'<li>{escape(skill)}</li>' for skill in course_skills)}</ul></details>
<div class="credential-record"><div><span>Certificate ID</span><code>{certificate_id}</code></div><button class="text-link" type="button" data-copy="{certificate_id}" data-message="Certificate ID copied.">{icon('copy')}Copy ID</button></div>
</section>
<dialog class="certificate-viewer" id="certificate-viewer" aria-labelledby="certificate-viewer-title"><div class="certificate-viewer-head"><h2 id="certificate-viewer-title">CyberOps Associate</h2><button class="icon-button" type="button" data-certificate-close aria-label="Close certificate preview"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><div class="certificate-viewer-image"><img data-full-image width="2325" height="1575" alt="Original CyberOps Associate course certificate awarded to Raahil Muhammad Wildan." decoding="async"></div><div class="certificate-viewer-foot"><a class="underlined" href="{certificate_pdf}" target="_blank" rel="noreferrer">View original PDF</a><a class="underlined" href="{certificate_png}" download="raahilmw-cyberops-associate.png">Download PNG</a></div></dialog>'''
page('Certifications','Certifications',certs,'/certifications/')

ARROW = '<svg class="cta-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M9 6h9v9"/></svg>'
MAIL_TARGETS = [
    ('Gmail', 'https://mail.google.com/mail/?view=cm&amp;fs=1&amp;to=' + EMAIL, 'Opens a draft in your browser'),
    ('Outlook', 'https://outlook.live.com/mail/0/deeplink/compose?to=' + EMAIL, 'Opens a draft in your browser'),
    ('Yahoo Mail', 'https://compose.mail.yahoo.com/?to=' + EMAIL, 'Opens a draft in your browser'),
    ('Mail app', 'mailto:' + EMAIL, 'Opens your default mail app'),
]
mail_options = ''.join(
    f'<li><a class="mail-option" href="{href}" target="_blank" rel="noreferrer">'
    f'<span class="mail-option-name">{name}</span>'
    f'<span class="mail-option-note">{note}</span>{ARROW}</a></li>'
    for name, href, note in MAIL_TARGETS)

contact=f'''<section class="contact-page shell">
{label('OPEN A CONVERSATION')}
<h1>Let’s compare<br>notes<span class="red">.</span></h1>
<p class="contact-intro">Bug bounty, security research,<br>and systems worth taking apart.</p>
<div class="intro-rule"><span class="mono">DIRECT LINES</span><span class="mono">EMAIL / HANDLE / WRITING</span></div>
</section>

<section class="shell contact-connect" data-rise>
<div class="contact-connect-head">{label('Find me online')}<h2>Let’s connect<span class="red">.</span></h2></div>
{social_deck()}
</section>

<section class="cta-band" data-rise aria-labelledby="cta-title">
<div class="shell cta-inner">
<div class="cta-copy" data-wipe>
<span class="cta-eyebrow">Start a conversation</span>
<h2 id="cta-title"><span class="cta-line">Got a project in mind?</span><span class="cta-line">Let’s talk<span class="cta-dot">.</span></span></h2>
</div>
<a class="cta-link" href="mailto:{EMAIL}" data-mail-open aria-haspopup="dialog" aria-controls="mail-picker"><span>Get in touch</span>{ARROW}</a>
</div>
</section>

<dialog id="mail-picker" class="mail-picker" aria-labelledby="mail-picker-title">
<div class="mail-picker-head"><span class="mono">SEND TO {EMAIL}</span><h2 id="mail-picker-title">Pick where to write<span class="red">.</span></h2></div>
<ul class="mail-options">{mail_options}</ul>
<div class="mail-picker-foot"><button class="text-link" type="button" data-copy="{EMAIL}" data-message="Email copied." data-close>{icon('copy')}Or just copy the address</button><button class="text-link" type="button" data-close>Cancel</button></div>
</dialog>'''

page('Contact','Contact',contact,'/contact/')
print('Built 8 portfolio pages.')
