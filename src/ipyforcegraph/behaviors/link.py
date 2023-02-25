"""Link behaviors for ``ipyforcegraph``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Optional, Tuple, Union

import ipywidgets as W
import traitlets as T

from ._base import Behavior, ShapeBase, TBoolFeature, TFeature, TNumFeature, _make_trait


@W.register
class LinkSelection(Behavior):
    """Enable link selection with synced ids of selected links."""

    _model_name: str = T.Unicode("LinkSelectionModel").tag(sync=True)

    selected: Tuple[Union[int, str], ...] = W.TypedTuple(
        T.Union((T.Int(), T.Unicode())),
        allow_none=True,
        help="the 0-based indices of any selected links",
    ).tag(sync=True)

    multiple: bool = T.Bool(True).tag(sync=True)

    selected_color: str = T.Unicode(
        "rgba(31, 120, 179, 1.0)", help="the color of selected links"
    ).tag(sync=True)

    selected_width: float = T.Float(2, help="the width of selected links").tag(
        sync=True
    )


@W.register
class LinkStyle(Behavior):
    """Customize link style."""

    _model_name: str = T.Unicode("LinkColorModel").tag(sync=True)
    color: TFeature = _make_trait("the color of the link")
    width: TFeature = _make_trait("the length of the arrow", numeric=True)


@W.register
class LinkTooltip(Behavior):
    """Customize link tooltips, displayed on hover."""

    _model_name: str = T.Unicode("LinkLabelModel").tag(sync=True)

    label: TFeature = _make_trait("the label to display in the tooltip")


@W.register
class LinkArrow(Behavior):
    """Customize arrows on links, based on a column or template."""

    _model_name: str = T.Unicode("LinkArrowModel").tag(sync=True)

    color: TFeature = _make_trait("the color of the arrow")
    length: TNumFeature = _make_trait("the length of the arrow", numeric=True)
    relative_position: TNumFeature = _make_trait(
        "the relative position of the arrow along the link, 0: source, 1: target",
        numeric=True,
    )


@W.register
class LinkParticles(Behavior):
    """Customize the animated particles on links.

    ..note::
        The ``speed`` should be between ``0.0``, stationary, and ``~0.1``,
        or they will exceed the frame rate of the animation.
    """

    _model_name: str = T.Unicode("LinkDirectionalParticleColorModel").tag(sync=True)
    color: TFeature = _make_trait("the color of the particles")
    density: TNumFeature = _make_trait(
        "the number particles, ideally 0.0 < ``value``", numeric=True
    )
    speed: TNumFeature = _make_trait(
        "the speed of the particles, ideally 0.0 < ``value`` < ~0.1", numeric=True
    )
    width: TNumFeature = _make_trait(
        "the size of the particles, ideally 0.0 < ``value`` < ~5", numeric=True
    )
