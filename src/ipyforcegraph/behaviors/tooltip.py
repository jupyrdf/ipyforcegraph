"""On-hover tooltip behaviors for ``ipyforcegraph`` nodes and links."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.
from __future__ import annotations

from typing import TYPE_CHECKING, Any, Optional

import ipywidgets as W
import traitlets as T

from ._base import Behavior, _make_trait

if TYPE_CHECKING:
    from .. import _types as _t
    from ._base import TFeature


@W.register
class NodeTooltip(Behavior):
    """Customize node tooltips, displayed on hover.

    These may be strings or full HTML.
    """

    _model_name: "_t.Tstr" = T.Unicode("NodeTooltipModel").tag(sync=True)

    label: TFeature = _make_trait(
        "the label to display when hovering over the ``node``, can be ``Column`` or ``Nunjucks`` template",
        stringy=False,
    )

    def __init__(self, label: Optional[TFeature] = None, **kwargs: Any):
        kwargs["label"] = label
        super().__init__(**kwargs)


@W.register
class LinkTooltip(Behavior):
    """Customize link tooltips, displayed on hover.

    These may be strings or full HTML.
    """

    _model_name: "_t.Tstr" = T.Unicode("LinkTooltipModel").tag(sync=True)

    label: TFeature = _make_trait(
        "the label to display when hovering over the ``link``, can be ``Column`` or ``Nunjucks`` template",
        stringy=False,
    )

    def __init__(self, label: Optional[TFeature] = None, **kwargs: Any):
        kwargs["label"] = label
        super().__init__(**kwargs)
