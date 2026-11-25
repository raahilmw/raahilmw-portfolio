"""Render a front-facing titanium loupe rim as a transparent WebP.

The annular height field has concentric turning marks, two polished chamfers
and a knurled grip. A synthetic strip-light studio is reflected in its surface
normals. The glass itself is supplied by the interactive page.
"""
from pathlib import Path

import numpy as np
from PIL import Image

SIZE = 896
INNER, OUTER = 354, 395
SAMPLES = 3
OUTPUT = Path(__file__).resolve().parents[1] / 'dist/assets/inspection-lens.webp'


def ease(lo, hi, value):
    t = np.clip((value - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


def band(radius, lo, hi, softness=.28):
    return ease(lo, lo + softness, radius) * (1 - ease(hi - softness, hi, radius))


def softbox(x, y, z, direction, width, height):
    """An elongated studio strip on the reflected hemisphere."""
    direction = np.array(direction, dtype=float)
    direction /= np.linalg.norm(direction)
    dx, dy, dz = direction
    azimuth = np.hypot(dx, dy)
    across = (-dy*x + dx*y) / azimuth
    along = dz*(dx*x + dy*y)/azimuth - azimuth*z
    facing = ease(.45, .83, dx*x + dy*y + dz*z)
    return np.exp(-.5*((across/width)**2 + (along/height)**2)) * facing


def finish():
    size = SIZE * SAMPLES
    y, x = np.ogrid[:size, :size]
    u = (x + .5) / SAMPLES - SIZE/2
    v = (y + .5) / SAMPLES - SIZE/2
    radius = np.hypot(u, v)
    rows, cols = np.nonzero((radius >= INNER) & (radius < OUTER))
    r = radius[rows, cols]
    theta = np.arctan2(v[rows, 0], u[0, cols])
    cs, sn = np.cos(theta), np.sin(theta)

    # dz/dr through a lathed cross section, from inner optical land to sidewall.
    # The smooth changes in slope round the cutting tool's shoulders.
    positions = [354,354.75,356,356.7,357.4,358.3,360.8,361.6,362.4,
                 363,363.7,364.8,365.8,366.4,367.5,368.1,370.7,372.1,
                 372.9,373.6,374.6,375.6,376.2,377.1,382,383.3,384.2,
                 385.6,386.3,387.1,388.2,389.4,390.3,391.3,393.6,395]
    slopes = [3.2,2.1,.8,-.5,.65,1.4,.92,.31,-.37,-.16,.48,.87,.42,-.22,
              .11,.025,.025,-.19,-.56,.48,.19,.05,.23,.07,.07,-.31,
              -.48,-.31,-.87,-.19,.27,-.36,-1.,-1.7,-2.1,-3.4]
    slope = np.interp(r, positions, slopes)
    angle_slope = np.zeros_like(r)
    # Diamond tool marks cut into the knurl band. Keep its silhouette circular.
    knurl = band(r, 376.9, 384.1, .75)
    a = theta*198 + (r-377)*.47
    b = theta*198 - (r-377)*.47
    tool_cut = (np.cos(a) + np.cos(b))*.5
    slope += knurl*.16*(np.sin(b)-np.sin(a))
    angle_slope += knurl*.29*(np.sin(a)+np.sin(b))
    fine = band(r, 366.9, 372.5, .55)
    slope += np.sin(r*np.pi*2/1.27)*.13*fine

    nx = -slope*cs + angle_slope*sn
    ny = -slope*sn - angle_slope*cs
    inv = 1 / np.sqrt(1 + nx*nx + ny*ny)
    nx, ny, nz = nx*inv, ny*inv, inv
    # Reflection of an orthographic view ray.
    rx, ry, rz = 2*nx*nz, 2*ny*nz, 2*nz*nz-1
    rough = .74 - .4*band(r,357.7,362.2) - .31*band(r,384,386.5)
    key = softbox(rx,ry,rz,(-.65,-.52,.56), .092+rough*.085, .55)
    fill = softbox(rx,ry,rz,(.74,.50,.47), .128+rough*.12, .51)
    overhead = softbox(rx,ry,rz,(.13,-.70,.70), .4, .22)
    strip = softbox(rx,ry,rz,(.72,-.34,.60), .027+rough*.036, .44)
    grazing = softbox(rx,ry,rz,(-.79,-.23,-.52), .16, .61)
    rim_light = softbox(rx,ry,rz,(.15,.96,-.24), .11, .32)

    # The large reflectors produce directional value changes across the full
    # circle, even on textured surfaces and at the lower lip.
    facing_key = np.clip((-.53*nx-.65*ny+.57*nz),0,1)
    ambient = 25 + 23*facing_key + 9*np.sin(theta-.43)
    ambient += 7*np.clip(-sn-.22,0,1)
    bright = 33*band(r,355.5,357.3) + 37*band(r,358.1,362.1)
    bright += 31*band(r,363.4,365.9) + 13*band(r,384,386.1)
    bright -= 11*band(r,372.4,373.3) + 9*band(r,386.35,387.04)
    ambient += bright + knurl*(4.8*tool_cut-6)
    ambient *= 1 - .27*band(r,353.9,355.5)
    ambient *= 1 - .22*ease(391.2,394.9,r)
    # Liner at the bottom looks deeper from this near-axial view.
    ambient -= 7*ease(.08,.98,sn)*band(r,388.4,394.8,1.1)
    rng = np.random.default_rng(38)
    turned = 2.6*np.cos(r*4.85+.28*np.sin(theta*17)) + 1.3*np.sin(r*13)
    noise = rng.normal(0,1.65,len(r)) + turned
    base = np.array([.86,.95,1.07])[None,:]*(ambient + noise)[:,None]
    base += key[:,None]*np.array([177,189,207])
    base += fill[:,None]*np.array([83,101,146])
    base += overhead[:,None]*np.array([49,61,91])
    base += strip[:,None]*np.array([135,145,184])
    base += grazing[:,None]*np.array([105,114,148])
    base += rim_light[:,None]*np.array([45,64,110])

    # A narrow reflected edge at the upper left, with a cold secondary rim.
    angle = np.angle(np.exp(1j*(theta+2.22)))
    upper_glint = np.exp(-.5*(angle/.29)**2) * np.exp(-.5*((r-360.7)/.69)**2)
    base += upper_glint[:,None]*np.array([94,98,111])
    # The cut face catches a thin slice of the white key softbox. Keeping
    # the streak on the bevel preserves the clear aperture at small sizes.
    hot_arc = np.exp(-.5*((angle+.105)/.14)**2)
    hot_flank = np.exp(-.5*((r-361.05)/1.32)**2)
    base += (hot_arc*hot_flank)[:,None]*np.array([106,109,119])
    outer_edge = np.exp(-.5*((r-391.35)/.66)**2)
    base += outer_edge[:,None]*np.array([19,25,41])
    # A single inset alignment notch in the face land.
    notch_angle = np.angle(np.exp(1j*(theta+.91)))
    tangential = notch_angle*r
    notch = np.exp(-(tangential/1.13)**4)*band(r,367.2,374.6,.56)
    recess = np.exp(-(tangential/1.77)**4)*band(r,366.8,375,.67)
    base *= 1 - recess[:,None]*.44
    base += notch[:,None]*np.array([146,167,201])
    # Compose against alpha before resampling, preventing coloured fringes at
    # either optical boundary on the site's light and dark appearances.
    image = np.zeros((size,size,4),dtype=np.uint8)
    image[rows,cols,:3] = np.uint8(np.clip(base,0,255))
    image[rows,cols,3] = 255
    return Image.fromarray(image).resize((SIZE,SIZE), Image.Resampling.LANCZOS)


if __name__ == '__main__':
    finish().save(OUTPUT, quality=93, method=6, exact=True)
