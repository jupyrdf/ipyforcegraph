"""Base classes for all defining shapes in a 2D canvas (and 3D?)."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import enum
from dataclasses import dataclass
from typing import Optional, Tuple


class DrawMethods(enum.Enum):
    """The drawing methods available."""

    FILL = "FILL"
    STROKE = "STROKE"
    FILL_AND_STROKE = "FILL_AND_STROKE"


@dataclass
class GraphicalObject:
    """
    Based on the Object Types in `declarative-canvas`

    https://github.com/lukix/declarative-canvas#objecttypes
    """

    draw_method: DrawMethods

    @property
    def type(
        self,
    ) -> str:  # TODO: determine if we need to change this to something else
        """The"""
        class_name = self.__class__.__name__
        if class_name == "GraphicalObject":
            raise TypeError(
                "Base `GraphicalObject` has no type, `type` is only defined for its subclasses."
            )
        return class_name.upper()


@dataclass
class Circle(GraphicalObject):
    """A circle drawing object.

    https://github.com/lukix/declarative-canvas#circle
    """

    x: float
    y: float
    radius: float


@dataclass
class Rect(GraphicalObject):
    """A rectangle drawing object.

    https://github.com/lukix/declarative-canvas#rectangle
    """

    x: float
    y: float
    width: float
    height: float
    rotation: float = 0.0  # in radians


@dataclass
class Image(GraphicalObject):
    """An image that can be drawn as per ``declarative-canvas`` library.

    https://github.com/lukix/declarative-canvas#image

    Image Object defined here: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
    """

    image: str  # TODO: figure out what this should be
    x: float
    y: float
    width: Optional[float] = None  # if None, use image original width
    height: Optional[float] = None  # if None, use image original height
    rotation: float = 0.0  # in radians


@dataclass
class Text(GraphicalObject):
    """A textual drawing object.

    https://github.com/lukix/declarative-canvas#text
    """

    text: str
    x: float
    y: float


@dataclass
class Point:
    """A 2-dimensional point to be used by the Path GraphicalObject."""

    x: float
    y: float


@dataclass
class Path(GraphicalObject):
    """A 2D path drawing object.

    https://github.com/lukix/declarative-canvas#path
    """

    points: Tuple[Point]
    close_path: bool = False


@dataclass
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
