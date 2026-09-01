"""Render the JL monogram to a transparent multi-size .ico.

The mark is four stroked segments on the LogoMark 128 viewBox, expanded here
into the filled regions their 8px stroke covers, so it can be rasterised
without an SVG engine (qlmanage flattens onto opaque white).
"""

import math
import struct
import zlib

# Colour of the mark (accent-strong), and the cropped viewBox from favicon.svg.
R, G, B = 0xFF, 0x4D, 0x6D
VIEW_X, VIEW_Y, VIEW_W = 16, 16, 96
SS = 4  # supersampling factor per axis


def covered(x: float, y: float) -> bool:
    """True when the point falls inside the stroked monogram."""
    # J: vertical bar, x=44 from y=40 down to the arc.
    if 40 <= x <= 48 and 40 <= y <= 88:
        return True
    # J: quarter-circle hook, centred on (28, 88) with radius 16.
    if x >= 28 and y >= 88:
        d = math.hypot(x - 28, y - 88)
        if 12 <= d <= 20:
            return True
    # L: vertical bar, x=64 from y=24 to the corner (mitred to y=88).
    if 60 <= x <= 68 and 24 <= y <= 88:
        return True
    # L: foot, y=84 out to x=100 (mitred back to x=60).
    if 60 <= x <= 100 and 80 <= y <= 88:
        return True
    return False


def render(size: int) -> bytes:
    """Rasterise to raw RGBA scanlines with a 0 filter byte per row."""
    rows = bytearray()
    step = VIEW_W / size
    for py in range(size):
        rows.append(0)
        for px in range(size):
            hits = 0
            for sy in range(SS):
                for sx in range(SS):
                    vx = VIEW_X + (px + (sx + 0.5) / SS) * step
                    vy = VIEW_Y + (py + (sy + 0.5) / SS) * step
                    if covered(vx, vy):
                        hits += 1
            alpha = round(255 * hits / (SS * SS))
            # Premultiplication is not used; keep colour flat and vary alpha.
            rows.extend((R, G, B, alpha))
    return bytes(rows)


def png(size: int) -> bytes:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(render(size), 9))
        + chunk(b"IEND", b"")
    )


sizes = [16, 32, 48, 256]
images = [(s, png(s)) for s in sizes]

header = struct.pack("<HHH", 0, 1, len(images))
offset = 6 + 16 * len(images)
entries, blob = b"", b""
for s, data in images:
    dim = 0 if s >= 256 else s  # 0 means 256 in the ICO directory
    entries += struct.pack("<BBBBHHII", dim, dim, 0, 0, 1, 32, len(data), offset)
    blob += data
    offset += len(data)

with open("favicon.ico", "wb") as f:
    f.write(header + entries + blob)

with open("preview-256.png", "wb") as f:
    f.write(images[-1][1])

print("wrote favicon.ico", len(header + entries + blob), "bytes")
