"""Draw the portfolio's original chip artwork at build quality. Requires Pillow."""
import math
import random
from pathlib import Path
from PIL import Image, ImageDraw

ASSETS = Path(__file__).resolve().parents[1] / "dist/assets"


def fingerprint():
    size = 720
    image = Image.new("RGBA", (size, size))
    pen = ImageDraw.Draw(image)
    # Stagger ridge endings and shift each loop's centre to form an offset whorl.
    for ridge in range(26):
        radius = 8 + 11.6 * ridge
        gap = .12 + .45 * max(0, (10 - ridge) / 10)
        seam = 1.24 + .18 * math.sin(ridge * .7)
        breaks = [seam, seam + gap]
        if ridge in (6, 11, 16, 19, 23):
            breaks.extend([3.5 + .2 * math.sin(ridge), 3.65 + .2 * math.sin(ridge)])
        segments = list(zip(breaks[1::2], breaks[2::2] + [breaks[0] + math.tau]))
        for start, end in segments:
            points = []
            for k in range(281):
                t = start + (end - start) * k / 280
                y = radius * 1.13 * math.sin(t)
                x = radius * (.85 + .07 * math.sin(t)) * math.cos(t)
                x += 27 * math.sin(y / 107 + .2) + 19 * math.cos(ridge / 9)
                x += .065 * y
                points.append((size / 2 + x, size / 2 + y - 14 + ridge * .8))
            pen.line(points, fill=(255, 255, 255, 255), width=5, joint="curve")
            for x, y in (points[0], points[-1]):
                pen.ellipse((x-2, y-2, x+2, y+2), fill="white")
    alpha = image.getchannel("A").resize((416, 416), Image.Resampling.LANCZOS)
    mask = alpha.point(lambda value: round(value / 17)).convert("P")
    mask.putpalette([255, 255, 255] * 16)
    mask.save(ASSETS / "identity-ridges.png", bits=4, transparency=bytes(range(0, 256, 17)), optimize=True)


def circuit_board():
    image = Image.new("RGB", (620, 620), "#203b4a")
    pen = ImageDraw.Draw(image)
    rng = random.Random(830)
    for x in range(12, 620, 16):
        for y in range(12, 620, 16):
            pen.point((x, y), fill="#547076")
    # Four independently routed banks, with plated vias at each termination.
    for rotation in range(4):
        for i in range(36):
            x = 99 + i * 12
            end = rng.randint(24, 83)
            turn = 6 * rng.randint(1, 6) * (1 if i > 17 else -1)
            points = [(x, 155), (x, end+abs(turn)+10), (x+turn, end+10), (x+turn, end)]
            pen.line(points, fill=rng.choice(("#80a5a3", "#56898b", "#4b737b", "#b29c76")), width=2)
            vx, vy = points[-1]
            pen.ellipse((vx-3, vy-3, vx+3, vy+3), fill="#c6b68b")
            pen.point((vx, vy), fill="#223844")
        image = image.transpose(Image.Transpose.ROTATE_90)
        pen = ImageDraw.Draw(image)
    for x, y in ((24, 24), (596, 24), (24, 596), (596, 596)):
        pen.ellipse((x-9,y-9,x+9,y+9), fill="#bca971")
        pen.ellipse((x-5,y-5,x+5,y+5), fill="#253341")
    image.save(ASSETS / "secure-element-board.webp", quality=88, method=6)


if __name__ == "__main__":
    fingerprint()
    circuit_board()
