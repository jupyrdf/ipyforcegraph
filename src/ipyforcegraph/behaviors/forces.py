"""Forces for controlling the layout of ``ipyforcegraph`` graphs.

Using documentation from:

- `d3-forces <https://github.com/d3/d3-force#links>`_
- `d3-forces-3d <https://github.com/vasturiano/d3-force-3d#api-reference>`_
"""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import enum
from typing import Any, Dict, Optional

import ipywidgets as W
import traitlets as T

from ._base import (  # TBoolFeature,; TFeature,
    BaseD3Force,
    Behavior,
    TNumFeature,
    _make_trait,
)

TForceDict = Dict[str, BaseD3Force]


@W.register
class GraphForces(Behavior):
    """Customize :class:`~ipyforcegraph.graphs.ForceGraph` force simulation.

    These also apply to :class:`~ipyforcegraph.graphs.ForceGraph3D`

    For more, see the frontend documentation on https://github.com/vasturiano/force-graph#force-engine-d3-force-configuration
    """

    _model_name: str = T.Unicode("GraphForcesModel").tag(sync=True)

    forces: TForceDict = T.Dict(
        value_trait=T.Instance(BaseD3Force, allow_none=True),
        help="named forces. Set a name `None` to remove a force: By default, ForceGraph has `link`, `charge`, and `center`.",
    ).tag(sync=True, **W.widget_serialization)

    warmup_ticks: Optional[int] = T.Int(
        0,
        min=0,
        help="layout engine cycles to dry-run at ignition before starting to render.",
    ).tag(sync=True)

    cooldown_ticks: Optional[int] = T.Int(
        -1,
        help="frames to render before stopping and freezing the layout engine. Values less than zero will be translated to `Infinity`.",
    ).tag(sync=True)

    alpha_min: Optional[float] = T.Float(
        0.0, min=0.0, max=1.0, help="simulation alpha min parameter"
    ).tag(sync=True)

    alpha_decay: Optional[float] = T.Float(
        0.0228,
        min=0.0,
        max=1.0,
        help="simulation intensity decay parameter",
    ).tag(sync=True)

    velocity_decay: Optional[float] = T.Float(
        0.4,
        min=0.0,
        max=1.0,
        help="nodes' velocity decay that simulates the medium resistance",
    ).tag(sync=True)

    def __init__(self, forces: Optional[TForceDict] = None, *args: Any, **kwargs: Any):
        kwargs["forces"] = forces or {}
        super().__init__(*args, **kwargs)


@W.register
class LinkForce(BaseD3Force):
    """This Link Force is between two nodes that share an edge.

    https://github.com/d3/d3-force#links
    """

    _model_name: str = T.Unicode("LinkForceModel").tag(sync=True)

    distance: TNumFeature = _make_trait(
        "the 'desired' distance of a link. Context takes ``link``", numeric=True
    )
    strength: TNumFeature = _make_trait(
        "the strength of a link in reaching its desired length. Context takes "
        "``link``",
        numeric=True,
    )


@W.register
class CenterForce(BaseD3Force):
    """The centering force translates nodes uniformly so that the mean position
    of all nodes (center of mass if all nodes have equal weight) is at the given
    position (x, y, z).

    https://github.com/d3/d3-force#centering
    """

    _model_name: str = T.Unicode("CenterForceModel").tag(sync=True)

    x: Optional[float] = T.Float(
        None,
        allow_none=True,
        help="sets the x-coordinate of the centering position to the specified number and returns this force.",
    ).tag(sync=True)

    y: Optional[float] = T.Float(
        None,
        allow_none=True,
        help="sets the y-coordinate of the centering position to the specified number and returns this force.",
    ).tag(sync=True)

    z: Optional[float] = T.Float(
        None,
        allow_none=True,
        help="sets the z-coordinate of the centering position to the specified number and returns this force.",
    ).tag(sync=True)


@W.register
class XForce(BaseD3Force):
    """The X position force push nodes towards a desired position along the
    given dimension with a configurable strength.

    https://github.com/d3/d3-force#positioning
    """

    _model_name: str = T.Unicode("XForceModel").tag(sync=True)

    x: TNumFeature = _make_trait(
        "nunjucks template sets the x-coordinate of the centering position to "
        "the specified number and returns this force. Context takes ``node``.",
        numeric=True,
    )

    strength: TNumFeature = _make_trait(
        "a nunjucks template to use to calculate strength. Context takes ``node```",
        numeric=True,
    )


@W.register
class YForce(BaseD3Force):
    """The Y position force push nodes towards a desired position along the
    given dimension with a configurable strength.

    https://github.com/d3/d3-force#positioning
    """

    _model_name: str = T.Unicode("YForceModel").tag(sync=True)

    y: TNumFeature = _make_trait(
        "sets the y-coordinate of the centering position to the specified number "
        "and returns this force. Context takes ``node``.",
        numeric=True,
    )

    strength: TNumFeature = _make_trait(
        "the strength of the force. Context takes ``node```",
        numeric=True,
    )


@W.register
class ZForce(BaseD3Force):
    """The Z position force push nodes towards a desired position along the
    given dimension with a configurable strength.

    https://github.com/d3/d3-force#positioning
    """

    _model_name: str = T.Unicode("ZForceModel").tag(sync=True)

    z: TNumFeature = _make_trait(
        "sets the z-coordinate of the centering position to the specified number "
        "and returns this force. Context takes ``node``.",
        numeric=True,
    )

    strength: TNumFeature = _make_trait(
        "the strength of the force. Context takes ``node```",
        numeric=True,
    )


@W.register
class ManyBodyForce(BaseD3Force):
    """The many-body (or n-body) force applies mutually amongst all nodes. It
    can be used to simulate gravity (attraction) if the strength is positive, or
    electrostatic charge (repulsion) if the strength is negative. This
    implementation uses quadtrees and the Barnes–Hut approximation to greatly
    improve performance; the accuracy can be customized using the theta
    parameter.

    https://github.com/d3/d3-force#many-body
    """

    _model_name: str = T.Unicode("ManyBodyForceModel").tag(sync=True)

    strength: TNumFeature = _make_trait(
        "a nunjucks template to use to calculate strength. Context takes ``node``",
        numeric=True,
    )

    theta: TNumFeature = _make_trait(
        "sets the Barnes-Hut approximation criterion to the specified number.",
        numeric=True,
    )

    distance_min: TNumFeature = _make_trait(
        "sets the minimum distance between nodes over which this force is considered.",
        numeric=True,
    )

    distance_max: TNumFeature = _make_trait(
        "sets the maximum distance between nodes over which this force is considered.",
        numeric=True,
    )


@W.register
class RadialForce(BaseD3Force):
    """The radial positioning force create a force towards a circle of the
    specified radius centered at (x, y).

    https://github.com/d3/d3-force#forceRadial
    """

    _model_name: str = T.Unicode("RadialForceModel").tag(sync=True)

    radius: TNumFeature = _make_trait(
        "radius of the force. Context takes ``node``",
        numeric=True,
    )

    strength: TNumFeature = _make_trait(
        "the strength of the force. Context takes ``node```",
        numeric=True,
    )

    x: TNumFeature = _make_trait(
        "sets the x-coordinate of the centering position to the specified number",
        numeric=True,
    )

    y: TNumFeature = _make_trait(
        "sets the y-coordinate of the centering position to the specified number",
        numeric=True,
    )

    z: TNumFeature = _make_trait(
        "sets the z-coordinate of the centering position to the specified number",
        numeric=True,
    )


@W.register
class CollisionForce(BaseD3Force):
    """The collision force treats nodes as circles with a given ``radius``, rather
    than points and prevents nodes from overlapping.

    https://github.com/d3/d3-force#collision
    """

    _model_name: str = T.Unicode("CollisionForceModel").tag(sync=True)

    radius: TNumFeature = _make_trait(
        "The radius of collision by node. Context takes ``node``",
        numeric=True,
    )

    strength: TNumFeature = _make_trait(
        "sets the strength of the force.",
        numeric=True,
    )


@W.register
class ClusterForce(BaseD3Force):
    """A force type that attracts nodes toward a set of cluster centers.

    https://github.com/vasturiano/d3-force-cluster-3d
    """

    _model_name: str = T.Unicode("ClusterForceModel").tag(sync=True)
    centers: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="Defines each node's cluster center. All cluster centers should be defined as a radius and set of coordinates { radius, x, y, z }, according to the number of spatial dimensions in the simulation.",
    ).tag(sync=True)
    strength: Optional[float] = T.Float(
        None,
        allow_none=True,
        min=0,
        max=1,
        help="sets the strength of the force.",
    ).tag(sync=True)
    center_inertia: Optional[float] = T.Float(
        None,
        allow_none=True,
        min=0,
        max=1,
        help="Lower values (close to 0) result in cluster center nodes with lower inertia: they are easily pulled around by other nodes in the cluster.",
    ).tag(sync=True)


class DAGMode(enum.Enum):
    off = None
    top_down = "td"
    button_up = "bu"
    left_right = "lr"
    right_left = "rl"
    radial_out = "radialout"
    radial_in = "radialin"


@W.register
class DAGForce(BaseD3Force):
    """This behavior enforces constraints for displaying Directed Acyclic
    Graphs.

    https://github.com/vasturiano/force-graph#force-engine-d3-force-configuration
    """

    _model_name: str = T.Unicode("DAGBehaviorModel").tag(sync=True)
    mode: str = T.Enum(
        values=[m.value for m in DAGMode],
        help="DAG constraint layout mode/direction",
        default_value=None,
    ).tag(sync=True)
    level_distance: float = T.Float(
        default_value=None,
        help="Distance between DAG levels",
        allow_none=True,
    ).tag(sync=True)
    node_filter: str = T.Unicode(
        "",
        help="a nunjucks template to use to calculate if node is part of the DAG layout",
    ).tag(sync=True)
