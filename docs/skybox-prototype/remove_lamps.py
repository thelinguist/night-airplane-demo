"""Prototype asset step: paint the horizon lamps out of the 2k LDR moonless_golf equirect.

Masks pixels in the horizon band that are bright in the source HDR (the clubhouse lamps,
linear luminance > 4), dilates the mask and inpaints the tone-mapped JPG with OpenCV's Telea
algorithm. Point lamps disappear; the diffuse warm glow around them stays.

Usage (from the repo root, needs numpy + opencv-python-headless):
    python docs/skybox-prototype/remove_lamps.py
"""

import os

os.environ["OPENCV_IO_ENABLE_OPENEXR"] = "1"
import cv2  # noqa: E402
import numpy as np  # noqa: E402

SRC = os.path.join(os.path.dirname(__file__), "..", "..", "public", "skybox", "moonless_golf")
LAMP_LUMINANCE = 4.0
HORIZON_BAND = (0.40, 0.56)  # fraction of image height

hdr = cv2.imread(os.path.join(SRC, "moonless_golf_2k.hdr"), cv2.IMREAD_UNCHANGED)
jpg = cv2.imread(os.path.join(SRC, "moonless_golf_2k_ev-0.5.jpg"), cv2.IMREAD_COLOR)
h, w, _ = hdr.shape
lum = hdr.mean(axis=2)
mask = np.zeros((h, w), np.uint8)
band = slice(int(h * HORIZON_BAND[0]), int(h * HORIZON_BAND[1]))
mask[band] = (lum[band] > LAMP_LUMINANCE).astype(np.uint8) * 255
mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
out = cv2.inpaint(jpg, mask, 7, cv2.INPAINT_TELEA)
cv2.imwrite(
    os.path.join(SRC, "moonless_golf_2k_ev-0.5_nolamps.jpg"),
    out,
    [cv2.IMWRITE_JPEG_QUALITY, 90, cv2.IMWRITE_JPEG_PROGRESSIVE, 1],
)
print(f"inpainted {int((mask > 0).sum())} px of {h * w}")
