"""On-hover tooltip behaviors for ``ipyforcegraph`` nodes and links."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import ipywidgets as W
import traitlets as T

from ._base import Behavior, TFeature, _make_trait


@W.register
class NodeTooltip(Behavior):
    """Customize node tooltips, displayed on hover.

    These may be strings or full HTML.
    """

    _model_name: str = T.Unicode("NodeTooltipModel").tag(sync=True)
    label: TFeature = _make_trait("the label to display when hovering over the node")


@W.register
class LinkTooltip(Behavior):
    """Customize link tooltips, displayed on hover.

    These may be strings or full HTML.
    """

    _model_name: str = T.Unicode("LinkTooltipModel").tag(sync=True)
    label: TFeature = _make_trait("the label to display when hovering over the link")
