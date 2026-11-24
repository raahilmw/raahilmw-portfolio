"""Render a single-page résumé using the public profile and its local fonts."""
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas


def write_resume(path, email, linkedin, roles, education, expertise, tools, report):
    for name, file in [('Manrope', 'font-2.woff2'), ('Manrope-Bold', 'font-5.woff2')]:
        pdfmetrics.registerFont(TTFont(name, str(path.parent / file)))
    pdf = Canvas(str(path), pagesize=A4, invariant=True)
    pdf.setTitle('Raahil Muhammad Wildan | Resume')
    pdf.setAuthor('Raahil Muhammad Wildan')
    left, right = 47, A4[0]-47
    ink, muted, accent = '#15263a', '#46596c', '#304f7f'

    def line(x, y, content, size=10, font='Manrope', color=ink, link=None):
        pdf.setFont(font, size)
        pdf.setFillColor(HexColor(color))
        pdf.drawString(x, y, content)
        length = pdf.stringWidth(content, font, size)
        if x + length > right + 1:
            raise ValueError(f'Line exceeds page width: {content}')
        if link:
            pdf.linkURL(link, (x, y-3, x+length, y+size), relative=0, thickness=0)

    def heading(y, content):
        line(left, y, content, 10.5, 'Manrope-Bold', accent)
        pdf.setStrokeColor(HexColor('#c0ccd7'))
        pdf.line(left, y-9, right, y-9)

    line(left, 779, 'Raahil Muhammad Wildan', 27, 'Manrope-Bold')
    line(left, 752, 'Penetration testing, bug hunting and security automation', 13)
    line(left, 731, 'Tangerang Selatan, Indonesia', color=muted)
    line(left, 706, email, color=accent, link='mailto:'+email)
    line(left+158, 706, 'LinkedIn / raahilmw', color=accent, link=linkedin)
    line(left+290, 706, 'GitHub / raahilmw', color=accent, link='https://github.com/raahilmw')
    heading(664, 'PROFILE')
    line(left, 637, 'Cybersecurity student with a background in networking and data center operations.')
    line(left, 621, 'I test web applications and APIs and document the impact of security findings.')
    heading(584, 'SELECTED EXPERIENCE')
    for i, (date, role, org) in enumerate(roles):
        y = 555 - i * 45
        line(left, y, date, 9.5, color=muted)
        line(left+120, y, org, 11.5, 'Manrope-Bold')
        line(left+120, y-16, role, color=muted)
    heading(408, 'EDUCATION')
    for i, (date, program, school) in enumerate(education):
        y = 380 - i * 44
        line(left, y, date, 9.5, color=muted)
        line(left+120, y, school, 11, 'Manrope-Bold')
        line(left+120, y-16, program, color=muted)
    heading(282, 'EXPERTISE AND TOOLS')
    line(left, 254, '   /   '.join(expertise))
    line(left, 234, ', '.join(tools), color=muted)
    heading(180, 'SELECTED WRITING')
    line(left, 152, 'How I Got Paid for Turning an Image Fetcher into an Arbitrary File Read', 11, 'Manrope-Bold', link=report)
    line(left, 130, 'October 2026  /  Read on Medium', 9.5, color=accent, link=report)
    pdf.showPage()
    pdf.save()
