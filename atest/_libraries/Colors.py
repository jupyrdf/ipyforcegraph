"""Some color tools."""
from typing import Tuple


def get_image_colors(path: str) -> Tuple[Tuple[int,...]]:
    from PIL import Image
    img = Image.open(path)
    return tuple(sorted(img.getcolors(99999), key=lambda x: -x[0]))

def color_palettes_should_be_different(img_a: str, img_b: str, header_rows: int=1, max_colors: int=10) -> None:
    """Return a palette diff"""
    a_colors = get_image_colors(img_a)[header_rows:max_colors]
    b_colors = get_image_colors(img_b)[header_rows:max_colors]
    print(img_a, a_colors)
    print(img_b, b_colors)
    assert a_colors != b_colors

