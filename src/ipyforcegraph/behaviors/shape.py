"""Base classes for all defining shapes in a 2D canvas (and 3D?)."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import enum
from dataclasses import dataclass
from typing import Tuple


class DrawMethods(enum.Enum):
    """The drawing methods available."""

    FILL = 'FILL'
    STROKE = 'STROKE'
    FILL_AND_STROKE = 'FILL_AND_STROKE'


class ObjectTypes(enum.Enum):
    """The shapes that can be used """

    CIRCLE = 'CIRCLE'
    PATH = 'PATH'
    IMAGE = 'IMAGE'
    TEXT = 'TEXT'
    RECT = 'RECT'
    TRANSFORM = 'TRANSFORM'


@dataclass
class GraphicalObject:

    draw_method: DrawMethods

    @property
    def type(self):
        class_name = self.__class__.__name__
        if class_name == "GraphicalObject":
            raise TypeError(f"Base GraphicalObject has no type!")
        return class_name.upper()


@dataclass
class Circle(GraphicalObject):

    x: float
    y: float
    radius: float


@dataclass
class Rect(GraphicalObject):

    x: float
    y: float
    width: float = None  # if None, use image original width
    height: float = None  # if None, use image original height
    rotation: float = 0.0  # in radians


@dataclass
class Image(GraphicalObject):
    """An image that can be drawn as per ``declarative-canvas`` library.
    
    Image Object defined here: https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
    """

    image: str  # TODO: figure out what this should be
    x: float
    y: float
    width: float
    height: float
    rotation: float = 0.0


@dataclass
class Text(GraphicalObject):

    text: str
    x: float
    y: float


@dataclass
class Point:

    x: float
    y: float


@dataclass
class Path(GraphicalObject):

    points: Tuple[Point]
    close_path: bool = False


@dataclass
class Transform(GraphicalObject):

    children: Tuple[GraphicalObject]
    dx: float = 0.0
    dy: float = 0.0
    scaleX: float = 1.0
    scaleY: float = 1.0
    skewX: float = 0.0
    skewY: float = 0.0
    rotation: float = 0.0
