"""Styling behaviors for ``ipyforcegraph`` nodes and links."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, Sequence, Tuple, Union

import ipywidgets as W
import traitlets as T

from ._base import Behavior, ShapeBase, TFeature, TNumFeature, _make_trait


@W.register
class NodeShapes(Behavior):
    """Change the shape of ``nodes`` using declarative statements."""

    _model_name: str = T.Unicode("NodeShapeModel").tag(sync=True)

    color: TFeature = _make_trait("the color of the node")
    shapes: Tuple[ShapeBase] = W.TypedTuple(
        T.Instance(ShapeBase),
        help="the shapes to draw for each ``node``",
    ).tag(sync=True, **W.widget_serialization)
    size: TFeature = _make_trait("the size of the node", numeric=True)

    def __init__(self, *shapes: Union[Sequence[ShapeBase], ShapeBase], **kwargs: Any):
        if len(shapes) == 1 and isinstance(shapes, list):
            shapes = shapes[0]
        kwargs["shapes"] = shapes
        super().__init__(**kwargs)


@W.register
class LinkShapes(Behavior):
    """Customize the shape of the ``links``."""

    _model_name: str = T.Unicode("LinkShapeModel").tag(sync=True)
    color: TFeature = _make_trait("the color of the link")
    width: TNumFeature = _make_trait("the width of the link", numeric=True)


@W.register
class LinkArrows(Behavior):
    """Customize the size, position, and color of arrows on directional ``links``."""

    _model_name: str = T.Unicode("LinkArrowsModel").tag(sync=True)

    color: TFeature = _make_trait("the color of the arrow")
    length: TNumFeature = _make_trait("the length of the arrow", numeric=True)
    relative_position: TNumFeature = _make_trait(
        "the relative position of the arrow along the link, 0.0: ``source`` end, 1.0: ``target`` end",
        numeric=True,
    )
