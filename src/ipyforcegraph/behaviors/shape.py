"""Base classes for all defining shapes in a 2D canvas (and 3D?)."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import enum
import re
from dataclasses import dataclass
from typing import Any, ClassVar, Collection, Mapping, Optional, Set, Tuple, Union

SNAKE_TO_CAMEL_REGEX = re.compile(r"(.*?)_([a-zA-Z])")


def snake_to_camel_sub_regex(match: re.Match) -> Any:
    return match.group(1) + match.group(2).upper()


def snake_to_camel(snake_case_text: str) -> str:
    return SNAKE_TO_CAMEL_REGEX.sub(snake_to_camel_sub_regex, snake_case_text, 0)


class DrawMethod(enum.Enum):
    """The drawing methods available."""

    FILL = "FILL"
    STROKE = "STROKE"
    FILL_AND_STROKE = "FILL_AND_STROKE"

    def __repr__(self) -> str:
        return f"<{self.value}>"


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
                if key in data
            },
        }
        statement.update({snake_to_camel(key): value for key, value in data.items()})
        return statement


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


@dataclass(frozen=True, unsafe_hash=True)
class Text(GraphicalObject):
    """A textual drawing object.

    https://github.com/lukix/declarative-canvas#text
    """

    CONTEXT_PROPERTIES = {
        "direction",
        "fill_text",
        "font",
        "font_kerning",
        "font_stretch",
        "font_variant_caps",
        "global_alpha",
        "letter_spacing",
        "stroke_text",
        "text_align",
        "text_baseline",
        "text_rendering",
        "word_spacing",
    }

    text: str
    x: float
    y: float
    draw_method: DrawMethod = DrawMethod.FILL_AND_STROKE


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
    }

    points: Tuple[Point]
    close_path: bool = False
    draw_method: DrawMethod = DrawMethod.FILL_AND_STROKE


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
