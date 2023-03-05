"""Configurable shapes for ``ipyforcegraph`` nodes."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, Optional

import ipywidgets as W
import traitlets as T

from ..trait_utils import JSON_TYPES, coerce
from ._base import ShapeBase, TBoolFeature, TFeature, TNumFeature, _make_trait


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
