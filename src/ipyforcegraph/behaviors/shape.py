"""Base classes for all shapes in a 2D canvas (and 3D?)."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import enum
import json
import re
from dataclasses import dataclass
from typing import Any, ClassVar, Collection, Mapping, Optional, Set, Tuple, Union

SNAKE_TO_CAMEL_REGEX = re.compile(r"(.*?)_([a-zA-Z])")


def snake_to_camel_sub_regex(match: re.Match) -> Any:
    return match.group(1) + match.group(2).upper()


def snake_to_camel(snake_case_text: str) -> str:
    return SNAKE_TO_CAMEL_REGEX.sub(snake_to_camel_sub_regex, snake_case_text, 0)


class SimpleJsonEncodableEnum(enum.Enum):
    """A base Enum class that can be encoded in JSON."""

    def __str__(self) -> str:
        return str(self.value)


class DrawMethod(SimpleJsonEncodableEnum):
    """The drawing methods available."""

    FILL = "FILL"
    STROKE = "STROKE"
    FILL_AND_STROKE = "FILL_AND_STROKE"

    def __repr__(self) -> str:
        return f"<{self.value}>"


class Direction(SimpleJsonEncodableEnum):
    LEFT_TO_RIGHT = "ltr"
    RIGHT_TO_LEFT = "rtl"
    INHERIT = "inherit"


class FontKerning(SimpleJsonEncodableEnum):
    AUTO = "auto"
    NORMAL = "normal"
    NONE = "none"


class FontStretch(SimpleJsonEncodableEnum):
    """
    Property of the Canvas API specifies how the font may be expanded or condensed when drawing text.

    ..note::
        This is an experimental technology.

    https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fontStretch
    """

    ULTRA_CONDENSED = "ultra-condensed"
    EXTRA_CONDENSED = "extra-condensed"
    CONDENSED = "condensed"
    SEMI_CONDENSED = "semi-condensed"
    NORMAL = "normal"
    SEMI_EXPANDED = "semi-expanded"
    EXPANDED = "expanded"
    EXTRA_EXPANDED = "extra-expanded"
    ULTRA_EXPANDED = "ultra-expanded"

    def __repr__(self) -> str:
        return f"<{self.value}>"


class FontVariantCaps(SimpleJsonEncodableEnum):
    """
    Property of the Canvas API specifies an alternative capitalization of the rendered text.

    ..note::
        This is an experimental technology.

    https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fontVariantCaps
    """

    NORMAL = "normal"
    SMALL_CAPS = "small-caps"
    ALL_SMALL_CAPS = "all-small-caps"
    PETITE_CAPS = "petite-caps"
    ALL_PETITE_CAPS = "all-petite-caps"
    UNICASE = "unicase"
    TITLING_CAPS = "titling-caps"

    def __repr__(self) -> str:
        return f"<{self.value}>"


class TextAlign(SimpleJsonEncodableEnum):
    """
    Property of the Canvas 2D API specifies the current text alignment used when drawing text.

    The alignment is relative to the x value of the ``fillText()`` method.
    For example, if `textAlign` is "center", then the text's left edge will be at x - (textWidth / 2).

    https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign
    """

    CENTER = "center"
    END = "end"
    LEFT = "left"
    RIGHT = "right"
    START = "start"


class TextBaseline(SimpleJsonEncodableEnum):
    """
    Property of the Canvas 2D API specifies the current text baseline used when drawing text.

    https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textBaseline
    """

    ALPHABETIC = "alphabetic"
    BOTTOM = "bottom"
    HANGING = "hanging"
    IDEOGRAPHIC = "ideographic"
    MIDDLE = "middle"
    TOP = "top"


class LineJoin(SimpleJsonEncodableEnum):
    """
    Property of the Canvas 2D API determines the shape used to join two line segments where they meet.

    https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
    """

    ROUND = "round"
    BEVEL = "bevel"
    MITER = "miter"


class TextRendering(SimpleJsonEncodableEnum):
    """
    Property of the Canvas API provides information to the rendering engine about what to optimize for when rendering text.

    ..note::
        This is an experimental technology.

    https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textRendering
    """

    AUTO = "auto"
    OPTIMIZE_SPEED = "optimizeSpeed"
    OPTIMIZE_LEGIBILITY = "optimizeLegibility"
    GEOMETRIC_PRECISION = "geometricPrecision"


FILL = DrawMethod.FILL
STROKE = DrawMethod.STROKE
FILL_AND_STROKE = DrawMethod.FILL_AND_STROKE


@dataclass(frozen=True, unsafe_hash=True)
class GraphicalObject:
    """
    Based on the Object Types in `declarative-canvas`

    https://github.com/lukix/declarative-canvas#objecttypes
    """

    CONTEXT_PROPERTIES: ClassVar[Set[str]] = set()

    @property
    def type(
        self,
    ) -> str:  # TODO: determine if we need to change this to something else
        """The type of the graphical object."""
        class_name = self.__class__.__name__
        if class_name == "GraphicalObject":
            raise TypeError(
                "Base `GraphicalObject` has no type, `type` is only defined for its subclasses."
            )
        return class_name.upper()

    @property
    def statement(
        self,
    ) -> Mapping[str, Union[Collection[str], DrawMethod, bool, float, int, str]]:
        """The statement used to declaratively draw the object by ``declarative-canvas``."""
        data = {**self.__dict__}
        statement = {
            "type": self.type,
            "contextProps": {
                snake_to_camel(key): data.pop(key)
                for key in self.CONTEXT_PROPERTIES
                if data.get(key) is not None
            },
        }
        statement.update(
            {
                snake_to_camel(key): value
                for key, value in data.items()
                if value is not None
            }
        )
        return statement

    def to_json(self, indent: int = 2, sort_keys: bool = True) -> str:
        """Encode GraphicalObject as JSON."""
        return json.dumps(
            self.statement, default=str, indent=indent, sort_keys=sort_keys
        )


@dataclass(frozen=True, unsafe_hash=True)
class Circle(GraphicalObject):
    """A circle drawing object.

    https://github.com/lukix/declarative-canvas#circle
    """

    CONTEXT_PROPERTIES = {
        "fill_style",
        "global_alpha",
        "line_width",
        "stroke_style",
    }

    x: float
    y: float
    radius: float
    draw_method: DrawMethod = DrawMethod.FILL


@dataclass(frozen=True, unsafe_hash=True)
class Rect(GraphicalObject):
    """A rectangle drawing object.

    https://github.com/lukix/declarative-canvas#rectangle
    """

    x: float
    y: float
    width: float
    height: float
    rotation: float = 0.0  # in radians
    draw_method: DrawMethod = DrawMethod.FILL


@dataclass(frozen=True, unsafe_hash=True)
class Image(GraphicalObject):
    """An image that can be drawn as per ``declarative-canvas`` library.

    https://github.com/lukix/declarative-canvas#image

    Image Object defined here: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
    """

    CONTEXT_PROPERTIES = {
        "filter",
        "global_alpha",
        "image_smoothing_enabled",
        "image_smoothing_quality",
    }

    image: str  # TODO: figure out what this should be
    x: float
    y: float
    width: Optional[float] = None  # if None, use image original width
    height: Optional[float] = None  # if None, use image original height
    rotation: float = 0.0  # in radians
    draw_method: DrawMethod = DrawMethod.FILL

    filter: Optional[str] = None
    global_alpha: Optional[float] = 1.0
    image_smoothing_enabled: Optional[bool] = True
    image_smoothing_quality: Optional[str] = None  # low, medium, high


@dataclass(frozen=True, unsafe_hash=True)
class Text(GraphicalObject):
    """A textual drawing object.

    https://github.com/lukix/declarative-canvas#text
    """

    CONTEXT_PROPERTIES = {
        "direction",
        "fill_style",
        "font",
        "font_kerning",
        "font_stretch",
        "font_variant_caps",
        "global_alpha",
        "letter_spacing",
        "stroke_style",
        "text_align",
        "text_baseline",
        "text_rendering",
        "word_spacing",
    }

    text: str
    x: float
    y: float
    draw_method: DrawMethod = DrawMethod.FILL_AND_STROKE

    direction: Direction = Direction.INHERIT
    fill_style: Optional[str] = None
    font: Optional[str] = None
    font_kerning: FontKerning = FontKerning.AUTO
    font_stretch: FontStretch = FontStretch.NORMAL
    font_variant_caps: FontVariantCaps = FontVariantCaps.NORMAL
    global_alpha: float = 1.0
    letter_spacing: str = "0px"
    stroke_style: Optional[str] = None
    text_align: TextAlign = TextAlign.START
    text_baseline: TextBaseline = TextBaseline.ALPHABETIC
    text_rendering: TextRendering = TextRendering.AUTO
    word_spacing: Optional[str] = None


@dataclass(frozen=True, unsafe_hash=True)
class Point:
    """A 2-dimensional point to be used by the Path GraphicalObject."""

    x: float
    y: float


@dataclass(frozen=True, unsafe_hash=True)
class Path(GraphicalObject):
    """A 2D path drawing object.

    https://github.com/lukix/declarative-canvas#path
    """

    CONTEXT_PROPERTIES = {
        "line_join",
        "miter_limit",
    }

    points: Tuple[Point]
    close_path: bool = False
    draw_method: DrawMethod = DrawMethod.FILL_AND_STROKE

    line_join: LineJoin = LineJoin.MITER
    miter_limit: float = 10.0


@dataclass(frozen=True, unsafe_hash=True)
class Transform(GraphicalObject):
    """A 2D transformation drawing object.

    https://github.com/lukix/declarative-canvas#transform
    """

    children: Tuple[GraphicalObject]
    dx: float = 0.0
    dy: float = 0.0
    scaleX: float = 1.0
    scaleY: float = 1.0
    skewX: float = 0.0
    skewY: float = 0.0
    rotation: float = 0.0  # in radians
