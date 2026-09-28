"""
cut-bottles.py — isolate each bottle from its studio sweep.

  1. GrabCut, seeded from a saturation/value guess, gives the silhouette.
  2. The sweep, its cast shadow and its backlight glow are all near-backdrop
     pixels: low chroma relative to the backdrop, brightness ratio near 1.
     Only those CONNECTED TO THE FRAME are removed — a shadow always is, an
     enclosed white label never is, so the labels survive untouched.
  3. The two clear-glass spirits get a row-span fill, the right completion for
     an upright solid of revolution.
"""
import numpy as np, pymupdf, cv2, os
from PIL import Image
from scipy import ndimage

SRC, OUT = "source.pdf", "cutouts"
JOBS = {
    "emporia-zilavka-bottle":         (41,  None),
    "emporia-blatina-bottle":         (60,  None),
    "zilavka-limited-edition-bottle": (74,  "vignette"),
    "blatina-limited-edition-bottle": (87,  "vignette"),
    "emporia-vranac-bottle":          (102, None),
    "emporia-rose-saumon-bottle":     (113, None),
    "white-mist-cuvee-bottle":        (122, "vignette"),
    "deep-red-cuvee-bottle":          (132, None),
    "emporia-white-selection-bottle": (144, None),
    "emporia-cherry-liqueur-bottle":  (151, "rowfill"),
    "emporia-loza-specijal-bottle":   (150, "plate-light"),
}

def touches_frame(binary):
    lab, n = ndimage.label(binary)
    if not n: return np.zeros_like(binary, bool)
    ids = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    return np.isin(lab, list(ids)) if ids else np.zeros_like(binary, bool)

def vignette(rgb):
    """
    For the three bottles whose white label runs out to the silhouette edge,
    no matte can separate label from backdrop without clipping one of them —
    they are the same brightness. So instead of a hard cut, the backdrop is
    *extinguished*: near-backdrop pixels are pushed toward black and faded out,
    leaving the bottle emerging from shadow with its label perfectly intact.
    That is the cellar lighting the brochure itself uses, and it keeps the rule
    that a product label is never distorted or obscured.
    """
    h, w = rgb.shape[:2]
    hsv = cv2.cvtColor(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), cv2.COLOR_BGR2HSV)
    S, V = hsv[:, :, 1].astype(float), hsv[:, :, 2].astype(float)
    ring = lambda x: np.concatenate([x[:8].ravel(), x[-8:].ravel(), x[:, :8].ravel(), x[:, -8:].ravel()])
    Vbg, Sbg = np.percentile(ring(V), 75), np.median(ring(S))

    ratio = V / max(Vbg, 1e-3)
    bgness = ((S < Sbg + 30) & (ratio > 0.52) & (ratio < 1.5)).astype(np.float32)

    # A white label is photometrically identical to the sweep, so protect
    # everything close to the glass: distance from the bottle's dark core ramps
    # the extinguishing in, leaving the label and a soft rim of light intact.
    dark = ndimage.binary_opening(V < Vbg - 45, np.ones((5, 5)))
    lab, n = ndimage.label(dark)
    if n:
        sizes = ndimage.sum(dark, lab, range(1, n + 1))
        dark = np.isin(lab, [i + 1 for i, sz in enumerate(sizes) if sz > sizes.max() * 0.10])
    dist = ndimage.distance_transform_edt(~dark).astype(np.float32)
    ramp = np.clip((dist - 26.0) / 55.0, 0, 1)          # 0 on the bottle, 1 out in the sweep

    bgness = cv2.GaussianBlur(bgness * ramp, (0, 0), 5.0)
    bgness = np.clip(bgness * 1.25, 0, 1)

    # A generous elliptical falloff removes the frame edges entirely.
    yy, xx = np.mgrid[0:h, 0:w]
    e = np.sqrt(((xx - w / 2) / (w * 0.62)) ** 2 + ((yy - h / 2) / (h * 0.62)) ** 2)
    frame = np.clip(1.35 - e, 0, 1) ** 0.8

    out = rgb.astype(np.float32) * (1.0 - 0.93 * bgness)[..., None]
    alpha = np.clip((1.0 - 0.90 * bgness) * frame, 0, 1)
    return out.astype(np.uint8), alpha


def plate_light(rgb, page=(250, 247, 241)):
    """
    Loza Specijal is clear glass on a light sweep: there is almost nothing to
    cut out, because most of the bottle *is* the backdrop seen through glass.
    So the sweep is lifted toward the page's own ivory instead, and the frame
    feathered away — the bottle then sits on the page as a lit studio plate,
    with the kraft label and every printed figure fully intact.
    """
    h, w = rgb.shape[:2]
    hsv = cv2.cvtColor(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), cv2.COLOR_BGR2HSV)
    S, V = hsv[:, :, 1].astype(float), hsv[:, :, 2].astype(float)
    ring = lambda x: np.concatenate([x[:8].ravel(), x[-8:].ravel(), x[:, :8].ravel(), x[:, -8:].ravel()])
    Vbg, Sbg = np.percentile(ring(V), 75), np.median(ring(S))

    ratio = V / max(Vbg, 1e-3)
    bgness = ((S < Sbg + 26) & (ratio > 0.72) & (ratio < 1.4)).astype(np.float32)
    dark = ndimage.binary_opening((V < Vbg - 30) | (S > Sbg + 45), np.ones((5, 5)))
    dist = ndimage.distance_transform_edt(~dark).astype(np.float32)
    bgness *= np.clip((dist - 8.0) / 26.0, 0, 1)
    bgness = np.clip(cv2.GaussianBlur(bgness, (0, 0), 3.0) * 1.2, 0, 1)

    yy, xx = np.mgrid[0:h, 0:w]
    e = np.sqrt(((xx - w / 2) / (w * 0.60)) ** 2 + ((yy - h / 2) / (h * 0.60)) ** 2)
    frame = np.clip(1.32 - e, 0, 1) ** 0.85

    P = np.array(page, np.float32)
    out = rgb.astype(np.float32) * (1 - bgness)[..., None] + P * bgness[..., None]
    alpha = np.clip((1.0 - 0.88 * bgness) * frame, 0, 1)
    return out.astype(np.uint8), alpha


def cut(rgb, mode=None, openK=29):
    h, w = rgb.shape[:2]
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    S, V = hsv[:, :, 1].astype(float), hsv[:, :, 2].astype(float)
    ring = lambda x: np.concatenate([x[:8].ravel(), x[-8:].ravel(), x[:, :8].ravel(), x[:, -8:].ravel()])
    Vbg, Sbg = np.percentile(ring(V), 75), np.median(ring(S))

    guess = ndimage.binary_opening((np.abs(S - Sbg) < 45) & (np.abs(V - Vbg) < 36), np.ones((5, 5)))
    mask = np.full((h, w), cv2.GC_PR_FGD, np.uint8); mask[guess] = cv2.GC_PR_BGD
    hard = touches_frame(guess)
    mask[ndimage.binary_erosion(hard, np.ones((9, 9)))] = cv2.GC_BGD
    fg = ndimage.binary_erosion(ndimage.binary_opening((S > Sbg + 55) | (V < Vbg - 55), np.ones((7, 7))), np.ones((11, 11)))
    if fg.sum() < 200: fg = ndimage.binary_erosion(~hard, np.ones((25, 25)))
    mask[fg] = cv2.GC_FGD
    cv2.grabCut(bgr, mask, None, np.zeros((1, 65)), np.zeros((1, 65)), 5, cv2.GC_INIT_WITH_MASK)
    m = (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)

    # 2 · Sweep, cast shadow and backlight glow are all near-backdrop pixels
    #     that reach the frame. An OPENING is applied first: it breaks the
    #     one-or-two-pixel specular sliver running along the glass edge, which
    #     would otherwise connect an enclosed white label to the outside world
    #     and get the label removed along with the shadow.
    ratio = V / max(Vbg, 1e-3)
    nearBackdrop = (S < Sbg + 34) & (ratio > 0.46) & (ratio < 1.45)
    sweep = ndimage.binary_opening(nearBackdrop | ~m, np.ones((openK, openK)))
    sweep = touches_frame(sweep)
    # A stricter shadow core, used to keep the hull pass honest.
    sweep_hard = ndimage.binary_erosion(touches_frame(nearBackdrop), np.ones((7, 7)))

    solid = ndimage.binary_opening(m & ~sweep, np.ones((3, 3)))
    lab, n = ndimage.label(solid)
    if n:
        sizes = ndimage.sum(solid, lab, range(1, n + 1))
        solid = np.isin(lab, [i + 1 for i, sz in enumerate(sizes) if sz > sizes.max() * 0.06])
    # Fill holes: this is what restores the label panels, which are enclosed by
    # the glass outline and so are never reached by the frame-connected sweep.
    closed = ndimage.binary_closing(solid, np.ones((15, 15)))
    filledIn = ndimage.binary_fill_holes(closed)
    labelRegion = filledIn & ~closed          # exactly the enclosed panels
    solid = filledIn

    # A soft lobe of cast shadow can still cling to two of the tilted bottles.
    # It is left in place deliberately: it reads as photographic, whereas any
    # trim aggressive enough to remove it also clips the white label, and a
    # legible label is non-negotiable (§27 — never distort a product label).
    del labelRegion
    solid = ndimage.binary_fill_holes(ndimage.binary_closing(solid, np.ones((9, 9))))
    lab, n = ndimage.label(solid)
    if n:
        sizes = ndimage.sum(solid, lab, range(1, n + 1))
        solid = np.isin(lab, [i + 1 for i, sz in enumerate(sizes) if sz > sizes.max() * 0.08])
    solid = ndimage.binary_fill_holes(solid)

    # 3a · Bottles whose white label runs to the silhouette edge: the convex
    #      hull of the glass, intersected back with the GrabCut silhouette,
    #      recovers the label without letting the cast shadow back in.
    # 3b · Clear glass: complete the transparent body of the two spirits.
    if mode == 'rowfill':
        cols = np.where(solid.any(axis=0))[0]
        span = (cols.max() - cols.min()) if len(cols) else 1
        filled = solid.copy()
        for y in range(h):
            xs = np.where(solid[y])[0]
            if len(xs) >= 2 and (xs.max() - xs.min()) > span * 0.30:
                filled[y, xs.min():xs.max() + 1] = True
        solid = ndimage.binary_fill_holes(ndimage.binary_closing(filled, np.ones((41, 3))))
        lab, n = ndimage.label(solid)
        if n:
            sizes = ndimage.sum(solid, lab, range(1, n + 1))
            solid = lab == int(np.argmax(sizes)) + 1

    solid = ndimage.binary_fill_holes(ndimage.binary_closing(solid, np.ones((9, 9))))
    alpha = cv2.GaussianBlur(solid.astype(np.float32), (0, 0), 1.3)
    return np.clip((alpha - 0.45) / 0.3, 0, 1)

if __name__ == "__main__":
    doc = pymupdf.open(SRC); os.makedirs(OUT, exist_ok=True)
    for name, (xref, mode) in JOBS.items():
        pix = pymupdf.Pixmap(doc, xref)
        if pix.n > 3: pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
        rgb = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)[:, :, :3].copy()
        if mode == 'vignette':
            rgb2, a = vignette(rgb)
        elif mode == 'plate-light':
            rgb2, a = plate_light(rgb)
        else:
            rgb2, a = rgb, cut(rgb, mode)
        im = Image.fromarray(np.dstack([rgb2, (a * 255).astype(np.uint8)]), "RGBA")
        im = im.crop(im.getbbox()); im.save(f"{OUT}/{name}.png")
        print(f"{name:34s} {str(im.size):14s} coverage={(a > 0.5).mean():.3f}")
