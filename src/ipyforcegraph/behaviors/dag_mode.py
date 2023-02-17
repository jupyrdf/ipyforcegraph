"""Forces for ``ipyforcegraph``.

Using documentation from:

- `force-graph Force Engine Configuration https://github.com/vasturiano/force-graph#force-engine-d3-force-configuration`_
"""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import enum

import ipywidgets as W
import traitlets as T

from ._base import Behavior


class DAGMode(enum.Enum):
    off = None
    top_down = "td"
    button_up = "bu"
    left_right = "lr"
    right_left = "rl"
    radial_out = "radialout"
    radial_in = "radialin"


@W.register
class DAGBehavior(Behavior):
    """This behavior enforces constraints for displaying Directed Acyclic Graphs."""

    _model_name: str = T.Unicode("DAGBehaviorModel").tag(sync=True)
    mode: str = T.Enum(values=[m.value for m in DAGMode], default_value=None).tag(
        sync=True
    )
    level_distance: float = T.Float(allow_none=True).tag(sync=True)
    node_filter: str = T.Unicode(
        "",
        help="a nunjucks template to use to calculate link distance. Context takes `link`",
    ).tag(sync=True)
    active: bool = T.Bool(True, help="whether the dag constraints are active.").tag(
        sync=True
    )
