# Kora's cartoon kit for Lessons with Kora: turns the three generated poses into the layers the app animates
# (apps/mobile/assets/kora, drawn by apps/mobile/src/components/kora/kora-avatar.tsx).
#
#   <pose>.webp        the cut-out body with the mouth painted out (the app draws the mouth as vectors) and the K logo
#   <pose>-blink.webp  closed eyes, as a patch that sits exactly over the open ones
#
# The pictures here were made once with minimax-h3 on Vultr: base.png from base.txt, then t-rest, t-explain and
# t-point from base.png as the reference with rest.txt, explain.txt and point.txt (image.mjs makes one). The
# numbers in POSES were measured on those pictures; a new picture needs its own. The same numbers are in the
# app's KIT table (mouth, and the blink box this script prints).
#
# Run: python compose.py   (Pillow + numpy). Set KORA_PROOFS to a folder to also get pictures to check by eye.
# Then: npx tsx mouth-sheet.mts (from apps/mobile) writes card.html, the still picture for lesson cards:
# screenshot it at 600 x 640 with a transparent background and save it as assets/kora/card.webp.
import os, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get('KORA_OUT') or os.path.join(HERE, '..', '..', '..', 'mobile', 'assets', 'kora')
os.makedirs(OUT, exist_ok=True)
PROOFS = os.environ.get('KORA_PROOFS')
W, H = 864, 1152
SKIN = np.array([146, 76, 34], np.float32)
LINE = (22, 12, 10)

# Measured on each picture. mouth: centre of the lip line, tilt in degrees, and the box to paint out.
# eyes: inner corner, outer corner and lowest point of the closed lid per eye, and the box to paint out.
POSES = {
    'rest': dict(src='t-rest', mouth=(429, 455, 0), mouth_box=(340, 428, 518, 514),
                 eyes=[dict(box=(304, 296, 400, 356), inner=(392, 338), outer=(312, 328), low=(352, 347)),
                       dict(box=(460, 296, 556, 356), inner=(468, 338), outer=(548, 328), low=(508, 347))],
                 logo=(548, 742), holes=[(215, 1010), (645, 1010), (430, 1100)]),
    'explain': dict(src='t-explain', mouth=(437, 436, -5), mouth_box=(338, 404, 532, 510),
                    eyes=[dict(box=(300, 298, 398, 360), inner=(390, 344), outer=(308, 330), low=(350, 351)),
                          dict(box=(458, 286, 556, 348), inner=(466, 334), outer=(546, 316), low=(506, 338))],
                    logo=(556, 742), holes=[]),
    'point': dict(src='t-point', mouth=(419, 447, -3), mouth_box=(328, 420, 506, 508),
                  eyes=[dict(box=(288, 296, 384, 356), inner=(376, 340), outer=(296, 328), low=(336, 348)),
                        dict(box=(444, 294, 540, 354), inner=(452, 338), outer=(532, 324), low=(492, 344))],
                  logo=(520, 742), holes=[]),
}


def is_skin(c):
    return np.abs(c - SKIN).sum(axis=-1) < 70


def paint_out(img, box, feather=7):
    """Fills the box with skin: each column fades from the skin above the box to the skin below it."""
    x0, y0, x1, y1 = box
    top = img[y0 - 4:y0, x0:x1].mean(axis=0)
    bot = img[y1:y1 + 4, x0:x1].mean(axis=0)
    med_t = np.median(top[is_skin(top)], axis=0) if is_skin(top).any() else SKIN
    med_b = np.median(bot[is_skin(bot)], axis=0) if is_skin(bot).any() else SKIN
    top[~is_skin(top)] = med_t
    bot[~is_skin(bot)] = med_b
    # Smooth along the row so a stray line above the box does not become a stripe.
    k = 15
    pad = lambda a: np.concatenate([np.repeat(a[:1], k, 0), a, np.repeat(a[-1:], k, 0)])
    sm = lambda a: np.stack([np.convolve(pad(a)[:, c], np.ones(2 * k + 1) / (2 * k + 1), 'valid') for c in range(3)], 1)
    top, bot = sm(top), sm(bot)
    t = np.linspace(0, 1, y1 - y0)[:, None, None]
    fill = top[None] * (1 - t) + bot[None] * t
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).rounded_rectangle((x0 + feather, y0 + feather, x1 - feather, y1 - feather), radius=26, fill=255)
    a = np.asarray(m.filter(ImageFilter.GaussianBlur(feather * 0.6))).astype(np.float32)[..., None] / 255
    full = img.copy()
    full[y0:y1, x0:x1] = fill
    return img * (1 - a) + full * a, a[..., 0]


def matte(img, holes):
    bg = np.array([246, 244, 244], np.float32)
    d = np.sqrt(((img - bg) ** 2).sum(axis=2))
    near = Image.fromarray(((d < 52) * 255).astype(np.uint8)).copy()
    seeds = [(x, y) for x in range(0, W, 4) for y in (0, H - 1)] + [(x, y) for y in range(0, H, 4) for x in (0, W - 1)] + holes
    # Below the face nothing of hers is white, so any patch of background colour there is a gap (between an arm and her side).
    seeds += [(x, y) for y in range(620, H, 5) for x in range(0, W, 5)]
    for s in seeds:
        if near.getpixel(s) == 255:
            ImageDraw.floodfill(near, s, 128)
    flood = Image.fromarray(((np.asarray(near) == 128) * 255).astype(np.uint8))
    band = np.asarray(flood.filter(ImageFilter.MaxFilter(5))) > 0
    soft = np.clip((d - 26) / 60, 0, 1)
    a = np.where(band, soft, 1.0).astype(np.float32)
    a[np.asarray(flood) > 0] = 0
    # Pull the edge in by a pixel so no pale fringe of the old background is left around her.
    pil = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    return np.asarray(pil).astype(np.float32) / 255


def richer(img):
    """The top came out a greyish purple: lift it towards Knowzone's purple, leaving skin and hair alone."""
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    purple = ((b > r + 12) & (r > g + 4)).astype(np.float32)
    purple = np.asarray(Image.fromarray((purple * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)[..., None] / 255
    pil = Image.fromarray(img.clip(0, 255).astype(np.uint8))
    sat = np.asarray(ImageEnhance.Brightness(ImageEnhance.Color(pil).enhance(1.5)).enhance(1.12)).astype(np.float32)
    return img * (1 - purple) + sat * purple


def closed_eyes(base, eyes):
    """The same face with the eyes shut: skin over each eye, then a lash line curving down."""
    img = base.copy()
    cover = np.zeros((H, W), np.float32)
    for e in eyes:
        img, a = paint_out(img, e['box'], feather=5)
        cover = np.maximum(cover, a)
    S = 4
    layer = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for e in eyes:
        (ix, iy), (ox, oy), (lx, ly) = e['inner'], e['outer'], e['low']
        cx, cy = 2 * lx - (ix + ox) / 2, 2 * ly - (iy + oy) / 2
        pts = [((1 - t) ** 2 * ix + 2 * (1 - t) * t * cx + t * t * ox, (1 - t) ** 2 * iy + 2 * (1 - t) * t * cy + t * t * oy) for t in np.linspace(0, 1, 40)]
        for i, (x, y) in enumerate(pts):
            w = 2.2 + 2.6 * np.sin(np.pi * min(1, i / 39 * 1.15))
            d.ellipse(((x - w) * S, (y - w) * S, (x + w) * S, (y + w) * S), fill=LINE + (255,))
        sx = 1 if ox > ix else -1
        for dx, dy in ((9, -5), (7, 3)):
            d.line((ox * S, oy * S, (ox + sx * dx) * S, (oy + dy) * S), fill=LINE + (255,), width=int(3.4 * S))
    layer = layer.resize((W, H), Image.LANCZOS)
    la = np.asarray(layer).astype(np.float32)
    al = la[..., 3:] / 255
    img = img * (1 - al) + la[..., :3] * al
    cover = np.maximum(cover, al[..., 0])
    return img, cover


kit = {'size': [W, H], 'poses': {}}
logo = Image.open(os.path.join(HERE, 'logo.png')).convert('RGBA')
for name, p in POSES.items():
    img = np.asarray(Image.open(os.path.join(HERE, p['src'] + '.png')).convert('RGB')).astype(np.float32)
    alpha = matte(img, p['holes'])
    img = richer(img)
    body, _ = paint_out(img, p['mouth_box'])
    blink, cover = closed_eyes(body, p['eyes'])
    rgba = np.dstack([body, alpha * 255]).clip(0, 255).astype(np.uint8)
    pil = Image.fromarray(rgba, 'RGBA')
    lx, ly = p['logo']
    L = 58
    lg = logo.resize((L, L), Image.LANCZOS)
    ring = Image.new('RGBA', (L + 6, L + 6), (0, 0, 0, 0))
    ImageDraw.Draw(ring).rounded_rectangle((0, 0, L + 5, L + 5), radius=16, fill=(255, 255, 255, 235))
    pil.alpha_composite(ring, (lx - 3, ly - 3))
    pil.alpha_composite(lg, (lx, ly))
    pil.save(os.path.join(OUT, name + '.webp'), quality=86, method=6)
    xs = [e['box'][0] for e in p['eyes']] + [e['box'][2] for e in p['eyes']]
    ys = [e['box'][1] for e in p['eyes']] + [e['box'][3] for e in p['eyes']]
    bx = (min(xs) - 14, min(ys) - 10, max(xs) + 14, max(ys) + 10)
    patch = np.dstack([blink, cover * 255]).clip(0, 255).astype(np.uint8)[bx[1]:bx[3], bx[0]:bx[2]]
    Image.fromarray(patch, 'RGBA').save(os.path.join(OUT, name + '-blink.webp'), quality=90, method=6)
    kit['poses'][name] = {'mouth': list(p['mouth']), 'blink': list(bx)}
    if PROOFS:
        Image.fromarray(body.clip(0, 255).astype(np.uint8)).crop((220, 220, 640, 560)).save(os.path.join(PROOFS, 'check-' + name + '-mouthless.png'))
        Image.fromarray(blink.clip(0, 255).astype(np.uint8)).crop((220, 220, 640, 560)).save(os.path.join(PROOFS, 'check-' + name + '-blink.png'))
        bgc = Image.new('RGBA', (W, H), (40, 30, 90, 255))
        bgc.alpha_composite(pil)
        bgc.convert('RGB').save(os.path.join(PROOFS, 'check-' + name + '-cut.png'))
json.dump(kit, open(os.path.join(HERE, 'kit.json'), 'w'), indent=1)
print(json.dumps(kit))
for f in sorted(os.listdir(OUT)):
    print(f, os.path.getsize(os.path.join(OUT, f)))
if PROOFS:
    sheet = Image.new('RGB', (840, 1020))
    i = 0
    for n in POSES:
        for k in ('mouthless', 'blink'):
            sheet.paste(Image.open(os.path.join(PROOFS, 'check-' + n + '-' + k + '.png')), ((i % 2) * 420, (i // 2) * 340))
            i += 1
    sheet.save(os.path.join(PROOFS, 'check-faces.png'))
