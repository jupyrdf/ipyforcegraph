"""Configurable shapes for ``ipyforcegraph`` nodes."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, Optional, Sequence, Tuple, Union

import ipywidgets as W
import traitlets as T

from ..trait_utils import JSON_TYPES, coerce
from ._base import (
    Behavior,
    ShapeBase,
    TBoolFeature,
    TFeature,
    TListNumFeature,
    TNumFeature,
    _make_trait,
)


class HasScale(ShapeBase):
    """A shape that has ``scale_on_zoom``."""

    _model_name: str = T.Unicode("HasScaleModel").tag(sync=True)

    scale_on_zoom: TBoolFeature = _make_trait(
        "whether font size/stroke respects the global scale", boolish=True
    )

    @T.validate("scale_on_zoom")
    def _validate_scale_bools(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.boolean)


class HasFillAndStroke(HasScale):
    """A shape that has ``fill`` and ``stroke``."""

    _model_name: str = T.Unicode("HasFillModel").tag(sync=True)
    fill: TFeature = _make_trait("the fill color of a shape")
    stroke: TFeature = _make_trait("the stroke color of a shape")
    stroke_width: TNumFeature = _make_trait("the stroke width of a shape", numeric=True)

    @T.validate("stroke_width")
    def _validate_has_fill_and_stroke_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


class HasDimensions(HasFillAndStroke):
    """A shape that has ``width``, ``height`` and ``depth``."""

    _model_name: str = T.Unicode("HasDimensionsModel").tag(sync=True)

    width: TNumFeature = _make_trait("the width of a shape in ``px``", numeric=True)
    height: TNumFeature = _make_trait("the height of a shape in ``px``", numeric=True)
    depth: TNumFeature = _make_trait("the depth of a shape in ``px``", numeric=True)
    opacity: TNumFeature = _make_trait("the opacity of a shape", numeric=True)

    @T.validate("width", "height", "depth", "opacity")
    def _validate_dimension_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


@W.register
class Text(HasFillAndStroke):
    """Draw a text shape, with an optional background."""

    _model_name: str = T.Unicode("TextShapeModel").tag(sync=True)

    text: TFeature = _make_trait("the text of a shape")
    font: TFeature = _make_trait("the font face of a shape")
    size: TNumFeature = _make_trait("the font size of a shape in ``px``", numeric=True)
    background: TFeature = _make_trait("the background fill color of a shape")
    padding: TNumFeature = _make_trait(
        "the padding around the shape in ``px``", numeric=True
    )

    def __init__(self, text: Optional[TFeature] = None, **kwargs: Any):
        if text is not None:
            kwargs["text"] = text
        super().__init__(**kwargs)

    @T.validate("size", "padding")
    def _validate_text_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


@W.register
class Ellipse(HasDimensions):
    """Draw an ellipse shape."""

    _model_name: str = T.Unicode("EllipseShapeModel").tag(sync=True)


@W.register
class Rectangle(HasDimensions):
    """Draw a rectangle shape."""

    _model_name: str = T.Unicode("RectangleShapeModel").tag(sync=True)


@W.register
class NodeShapes(Behavior):
    """Change the shape of nodes using declarative statements.

    If non-empty, custom ``shapes`` will override the simple ``size`` and ``color``.
    """

    _model_name: str = T.Unicode("NodeShapeModel").tag(sync=True)

    size: TFeature = _make_trait("the size of the default circle shape", numeric=True)
    color: TFeature = _make_trait("the color of the default circle shape")
    shapes: Tuple[ShapeBase] = W.TypedTuple(
        T.Instance(ShapeBase),
        help="the shapes to draw for each ``node``",
    ).tag(sync=True, **W.widget_serialization)

    def __init__(self, *shapes: Union[Sequence[ShapeBase], ShapeBase], **kwargs: Any):
        if len(shapes) == 1 and isinstance(shapes, list):
            shapes = shapes[0]
        kwargs["shapes"] = shapes
        super().__init__(**kwargs)

    @T.validate("size")
    def _validate_node_shape_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


@W.register
class LinkShapes(Behavior):
    """Customize the shape of the ``links``."""

    _model_name: str = T.Unicode("LinkShapeModel").tag(sync=True)

    color: TFeature = _make_trait("the color of the link")
    curvature: TNumFeature = _make_trait(
        "the curvature of the link, 0: straight, 1: circular", numeric=True
    )
    line_dash: TListNumFeature = _make_trait(
        "the dash pattern, e.g., [5, 15] to draw a repeating pattern of a 5-units-long segment followed by a 15-units-long blank",
        by_column=False,
        by_template=True,
        stringy=False,
    )
    width: TNumFeature = _make_trait("the width of the link", numeric=True)

    @T.validate("curvature", "width")
    def _validate_link_shape_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)

    @T.validate("line_dash")
    def _validate_link_line_dash(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.array)


@W.register
class LinkArrows(Behavior):
    """Customize the size, position, and color of arrows on ``links``."""

    _model_name: str = T.Unicode("LinkArrowModel").tag(sync=True)

    color: TFeature = _make_trait("the color of the arrow")
    length: TNumFeature = _make_trait("the length of the arrow", numeric=True)
    relative_position: TNumFeature = _make_trait(
        "the relative position of the arrow along the link, 0.0: ``source`` end, 1.0: ``target`` end",
        numeric=True,
    )

    @T.validate("length", "relative_position")
    def _validate_arrow_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)
