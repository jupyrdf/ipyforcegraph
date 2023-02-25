"""Configurable shapes."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any

import ipywidgets as W
import traitlets as T

from ._base import ShapeBase, TBoolFeature, TFeature, TNumFeature, _make_trait


@W.register
class TextShape(ShapeBase):
    """Draw a text shape."""

    _model_name: str = T.Unicode("TextShapeModel").tag(sync=True)

    text: TFeature = _make_trait("the text of a shape")

    font: TFeature = _make_trait("the font face of a shape")

    size: TNumFeature = _make_trait("the font size of a shape in ``px``", numeric=True)

    fill: TFeature = _make_trait("the fill color of a shape")

    stroke: TFeature = _make_trait("the stroke color of a shape")

    stroke_width: TNumFeature = _make_trait("the stroke width of a shape", numeric=True)

    background: TFeature = _make_trait("the background of a shape")

    padding: TNumFeature = _make_trait(
        "the padding around the shape in ``px``", numeric=True
    )

    scale_on_zoom: TBoolFeature = _make_trait(
        "whether font size/stroke respects the global scale", boolish=True
    )

    def __init__(self, text: TFeature, **kwargs: Any):
        if text is not None:
            kwargs["text"] = text
        super().__init__(**kwargs)
