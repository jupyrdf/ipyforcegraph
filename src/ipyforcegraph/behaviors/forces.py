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

from .. import _types as _t
from ..trait_utils import JSON_TYPES, coerce, validate_enum
from ._base import (
    BaseD3Force,
    Behavior,
    TBoolFeature,
    TFeature,
    TNumFeature,
    _make_trait,
)

TForceDict = Dict[str, BaseD3Force]
TForceDictDesc = T.TraitType[Dict[str, BaseD3Force], Dict[str, BaseD3Force]]


@W.register
class GraphForces(Behavior):
    """Customize :class:`~ipyforcegraph.graphs.ForceGraph` force simulation.

    These also apply to :class:`~ipyforcegraph.graphs.ForceGraph3D`

    For more, see the frontend documentation on https://github.com/vasturiano/force-graph#force-engine-d3-force-configuration
    """

    _model_name: _t.Tstr = T.Unicode("GraphForcesModel").tag(sync=True)

    forces: TForceDictDesc = T.Dict(
        value_trait=T.Instance(BaseD3Force, allow_none=True),
        help="named forces. Set a name `None` to remove a force: By default, ForceGraph has `link`, `charge`, and `center`",
    ).tag(sync=True, **W.widget_serialization)

    warmup_ticks: _t.Tint = T.Int(
        0,
        min=0,
        help="layout engine cycles to dry-run at ignition before starting to render",
    ).tag(sync=True)

    cooldown_ticks: _t.Tint = T.Int(
        -1,
        help="frames to render before stopping and freezing the layout engine. Values less than zero will be translated to `Infinity`",
    ).tag(sync=True)

    alpha_min: _t.Tfloat = T.Float(
        0.0, min=0.0, max=1.0, help="simulation alpha min parameter"
    ).tag(sync=True)

    alpha_decay: _t.Tfloat = T.Float(
        0.0228,
        min=0.0,
        max=1.0,
        help="simulation intensity decay parameter",
    ).tag(sync=True)

    velocity_decay: _t.Tfloat = T.Float(
        0.4,
        min=0.0,
        max=1.0,
        help="nodes' velocity decay that simulates the medium resistance",
    ).tag(sync=True)

    def __init__(self, forces: Optional[TForceDict] = None, *args: Any, **kwargs: Any):
        kwargs["forces"] = forces or {}
        super().__init__(*args, **kwargs)


@W.register
class Link(BaseD3Force):
    """This Link Force is between two nodes that share an edge.

    https://github.com/d3/d3-force#links
    """

    _model_name: _t.Tstr = T.Unicode("LinkForceModel").tag(sync=True)

    distance: TNumFeature = _make_trait(
        "the 'desired' distance of a link. Context takes ``link``", numeric=True
    )
    strength: TNumFeature = _make_trait(
        "the strength of a link in reaching its desired length. Context takes "
        "``link``",
        numeric=True,
    )

    @T.validate("distance", "strength")
    def _validate_link_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


@W.register
class Center(BaseD3Force):
    """The centering force translates nodes uniformly so that the mean position
    of all nodes (center of mass if all nodes have equal weight) is at the given
    position (x, y, z).

    https://github.com/d3/d3-force#centering
    """

    _model_name: _t.Tstr = T.Unicode("CenterForceModel").tag(sync=True)

    x: _t.Tfloat_maybe = T.Float(
        None,
        allow_none=True,
        help="the x-coordinate of the position to center the nodes on",
    ).tag(sync=True)

    y: _t.Tfloat_maybe = T.Float(
        None,
        allow_none=True,
        help="the y-coordinate of the position to center the nodes on",
    ).tag(sync=True)

    z: _t.Tfloat_maybe = T.Float(
        None,
        allow_none=True,
        help="the z-coordinate of the position to center the nodes on (only applies to ``ForceGraph3D``)",
    ).tag(sync=True)


@W.register
class X(BaseD3Force):
    """The X position force push nodes towards a desired position along the
    given dimension with a configurable strength.

    https://github.com/d3/d3-force#positioning
    """

    _model_name: _t.Tstr = T.Unicode("XForceModel").tag(sync=True)

    x: TNumFeature = _make_trait(
        "the x-coordinate of the centering position to the specified number. "
        "Context takes ``node``.",
        numeric=True,
    )

    strength: TNumFeature = _make_trait(
        "the strength of the force. Context takes ``node``",
        numeric=True,
        default_value=0,
        allow_none=False,
    )

    @T.validate("strength", "x")
    def _validate_x_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


@W.register
class Y(BaseD3Force):
    """The Y position force push nodes towards a desired position along the
    given dimension with a configurable strength.

    https://github.com/d3/d3-force#positioning
    """

    _model_name: _t.Tstr = T.Unicode("YForceModel").tag(sync=True)

    y: TNumFeature = _make_trait(
        "the y-coordinate of the centering position. " "Context takes ``node``.",
        numeric=True,
    )

    strength: TNumFeature = _make_trait(
        "the strength of the force. Context takes ``node``",
        numeric=True,
        default_value=0,
        allow_none=False,
    )

    @T.validate("strength", "y")
    def _validate_y_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


@W.register
class Z(BaseD3Force):
    """The Z position force push nodes towards a desired position along the
    given dimension with a configurable strength.

    .. note::
       Only affects :class:`~ipyforcegraph.graphs.ForceGraph3D`.

    https://github.com/d3/d3-force#positioning
    """

    _model_name: _t.Tstr = T.Unicode("ZForceModel").tag(sync=True)

    z: TNumFeature = _make_trait(
        "the z-coordinate of the centering position. Context takes ``node``.",
        numeric=True,
    )

    strength: TNumFeature = _make_trait(
        "the strength of the force. Context takes ``node``",
        numeric=True,
        default_value=0,
        allow_none=False,
    )

    @T.validate("strength", "z")
    def _validate_z_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


@W.register
class ManyBody(BaseD3Force):
    """The many-body (or n-body) force applies mutually amongst all nodes. It
    can be used to simulate gravity (attraction) if the strength is positive, or
    electrostatic charge (repulsion) if the strength is negative. This
    implementation uses quadtrees and the Barnes–Hut approximation to greatly
    improve performance; the accuracy can be customized using the theta
    parameter.

    https://github.com/d3/d3-force#many-body
    """

    _model_name: _t.Tstr = T.Unicode("ManyBodyForceModel").tag(sync=True)

    strength: TNumFeature = _make_trait(
        "a nunjucks template to use to calculate strength. Context takes ``node``",
        numeric=True,
        default_value=0,
        allow_none=False,
    )

    theta: _t.Tfloat_maybe = T.Float(
        None,
        allow_none=True,
        help="the Barnes-Hut approximation criterion",
    ).tag(sync=True)

    distance_min: _t.Tfloat_maybe = T.Float(
        None,
        allow_none=True,
        help="the minimum distance between nodes over which this force is considered",
    ).tag(sync=True)

    distance_max: _t.Tfloat_maybe = T.Float(
        None,
        allow_none=True,
        help="the maximum distance between nodes over which this force is considered",
    ).tag(sync=True)

    @T.validate("strength")
    def _validate_manybody_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


@W.register
class Radial(BaseD3Force):
    """The radial positioning force create a force towards a circle of the
    specified radius centered at (x, y).

    https://github.com/d3/d3-force#forceRadial
    """

    _model_name: _t.Tstr = T.Unicode("RadialForceModel").tag(sync=True)

    radius: TNumFeature = _make_trait(
        "radius of the force. Context takes ``node``",
        numeric=True,
    )

    strength: TNumFeature = _make_trait(
        "the strength of the force. Context takes ``node``",
        numeric=True,
        default_value=0,
        allow_none=False,
    )

    x: _t.Tfloat_maybe = T.Float(
        None,
        allow_none=True,
        help="the x-coordinate of the centering position",
    ).tag(sync=True)

    y: _t.Tfloat_maybe = T.Float(
        None,
        allow_none=True,
        help="the y-coordinate of the centering position",
    ).tag(sync=True)

    z: _t.Tfloat_maybe = T.Float(
        None,
        allow_none=True,
        help="the z-coordinate of the centering position",
    ).tag(sync=True)

    @T.validate("strength", "radius")
    def _validate_radial_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


@W.register
class Collision(BaseD3Force):
    """The collision force treats nodes as circles with a given ``radius``, rather
    than points and prevents nodes from overlapping.

    https://github.com/d3/d3-force#collision
    """

    _model_name: _t.Tstr = T.Unicode("CollisionForceModel").tag(sync=True)

    radius: TNumFeature = _make_trait(
        "The radius of collision by node. Context takes ``node``",
        numeric=True,
    )

    strength: _t.Tfloat_maybe = T.Float(
        None,
        allow_none=True,
        min=0.0,
        max=1.0,
        help="the strength of the force",
    ).tag(sync=True)

    @T.validate("radius")
    def _validate_collision_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


@W.register
class Cluster(BaseD3Force):
    """A force type that attracts nodes toward a set of cluster centers.

    https://github.com/vasturiano/d3-force-cluster-3d
    """

    _model_name: _t.Tstr = T.Unicode("ClusterForceModel").tag(sync=True)

    strength: _t.Tfloat_maybe = T.Float(
        None,
        allow_none=True,
        min=0.0,
        max=1.0,
        help="the strength of the force",
    ).tag(sync=True)

    inertia: _t.Tfloat_maybe = T.Float(
        None,
        allow_none=True,
        min=0.0,
        max=1.0,
        help=(
            "lower values result in cluster center nodes more easily pulled "
            "around by other nodes in the cluster."
        ),
    ).tag(sync=True)

    # node context
    key: TFeature = _make_trait(
        "a cluster key to which a node belongs. Context takes ``node``.",
    )

    # cluster context
    radius: TNumFeature = _make_trait(
        "the radius of a cluster. Context takes ``cluster``, ``node``, ``key``, and ``nodes``.",
        numeric=True,
        by_column=False,
        by_wrapper=False,
    )

    x: TNumFeature = _make_trait(
        "the x-coordinate of a cluster. Context takes ``cluster``, ``node``, ``key``, and ``nodes``.",
        numeric=True,
        by_column=False,
        by_wrapper=False,
    )

    y: TNumFeature = _make_trait(
        "the y-coordinate of a cluster. Context takes ``cluster``, ``node``, ``key``, and ``nodes``.",
        numeric=True,
        by_column=False,
        by_wrapper=False,
    )

    z: TNumFeature = _make_trait(
        "the z-coordinate of a cluster. Context takes ``cluster``, ``node``, ``key``, and ``nodes``.",
        numeric=True,
        by_column=False,
        by_wrapper=False,
    )

    def __init__(self, key: Optional[TFeature] = None, *args: Any, **kwargs: Any):
        kwargs["key"] = key
        super().__init__(*args, **kwargs)

    @T.validate("x", "y", "z", "radius")
    def _validate_cluster_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


@W.register
class DAG(BaseD3Force):
    """This behavior enforces constraints for displaying Directed Acyclic
    Graphs.

    https://github.com/vasturiano/force-graph#force-engine-d3-force-configuration
    """

    class Mode(enum.Enum):
        """The layout orientation options for the DAG."""

        off = None
        top_down = "td"
        bottom_up = "bu"
        left_right = "lr"
        right_left = "rl"
        radial_out = "radialout"
        radial_in = "radialin"

    _model_name: _t.Tstr = T.Unicode("DAGBehaviorModel").tag(sync=True)

    mode: T.Enum[str, str] = T.Enum(
        values=[*[m.value for m in Mode], *Mode],
        help="DAG constraint layout mode/direction",
        default_value=None,
        allow_none=True,
    ).tag(sync=True)

    level_distance: _t.Tfloat_maybe = T.Float(
        default_value=None,
        help="distance between DAG levels",
        allow_none=True,
    ).tag(sync=True)

    node_filter: TBoolFeature = _make_trait(
        "whether node is part of the DAG layout",
        default_value=True,
        boolish=True,
    )

    def __init__(self, mode: Optional[Any] = None, *args: Any, **kwargs: Any):
        kwargs["mode"] = mode
        super().__init__(*args, **kwargs)

    @T.validate("node_filter")
    def _validate_scale_bools(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.boolean)

    @T.validate("mode")
    def _validate_enum(self, proposal: T.Bunch) -> Any:
        return validate_enum(proposal, DAG.Mode)
