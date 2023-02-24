"""Forces for ``ipyforcegraph``.

Using documentation from:

- `d3-forces <https://github.com/d3/d3-force#links>`_
- `d3-forces-3d <https://github.com/vasturiano/d3-force-3d#api-reference>`_
"""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import enum
from typing import Optional

import ipywidgets as W
import traitlets as T

from ._base import BaseD3Force


@W.register
class LinkForce(BaseD3Force):
    """This Link Force is between two nodes that share an edge.

    https://github.com/d3/d3-force#links
    """

    _model_name: str = T.Unicode("LinkForceModel").tag(sync=True)
    # id_accessor
    distance: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link distance. Context takes `link`",
    ).tag(sync=True)

    strength: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate link strength. Context takes `link`",
    ).tag(sync=True)

    iterations: Optional[int] = T.Unicode(
        None,
        allow_none=True,
        help="the number of iterations per application to the specified number and returns this force.",
    ).tag(sync=True)


@W.register
class CenterForce(BaseD3Force):
    """The centering force translates nodes uniformly so that the mean position
    of all nodes (center of mass if all nodes have equal weight) is at the given
    position (x, y, z).

    https://github.com/d3/d3-force#centering
    """

    _model_name: str = T.Unicode("CenterForceModel").tag(sync=True)
    key: str = T.Unicode("center").tag(sync=True)
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
    x: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="nunjucks template sets the x-coordinate of the centering position to the specified number and returns this force. Context takes `node`.",
    ).tag(sync=True)

    strength: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate strength. Context takes `node`",
    ).tag(sync=True)


@W.register
class YForce(BaseD3Force):
    """The Y position force push nodes towards a desired position along the
    given dimension with a configurable strength.

    https://github.com/d3/d3-force#positioning
    """

    _model_name: str = T.Unicode("YForceModel").tag(sync=True)

    y: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="nunjucks template sets the y-coordinate of the centering position to the specified number and returns this force. Context takes `node`.",
    ).tag(sync=True)

    strength: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate strength. Context takes `node`",
    ).tag(sync=True)


@W.register
class ZForce(BaseD3Force):
    """The Z position force push nodes towards a desired position along the
    given dimension with a configurable strength.

    https://github.com/d3/d3-force#positioning
    """

    _model_name: str = T.Unicode("ZForceModel").tag(sync=True)

    z: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="nunjucks template sets the z-coordinate of the centering position to the specified number and returns this force. Context takes `node`.",
    ).tag(sync=True)

    strength: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate strength. Context takes `node`",
    ).tag(sync=True)


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
    strength: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate strength. Context takes `node`",
    ).tag(sync=True)

    theta: Optional[float] = T.Float(
        None,
        allow_none=True,
        help="sets the Barnes–Hut approximation criterion to the specified number and returns this force.",
    ).tag(sync=True)

    distance_min: Optional[float] = T.Float(
        None,
        allow_none=True,
        help="sets the minimum distance between nodes over which this force is considered.",
    ).tag(sync=True)

    distance_max: Optional[float] = T.Float(
        None,
        allow_none=True,
        help="sets the maximum distance between nodes over which this force is considered.",
    ).tag(sync=True)


@W.register
class RadialForce(BaseD3Force):
    """The radial positioning force create a force towards a circle of the
    specified radius centered at (x, y).

    https://github.com/d3/d3-force#forceRadial
    """

    _model_name: str = T.Unicode("RadialForceModel").tag(sync=True)
    radius: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate radius. Context takes `node`",
    ).tag(sync=True)

    strength: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate strength. Context takes `node`",
    ).tag(sync=True)

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
class CollisionForce(BaseD3Force):
    """The collision force treats nodes as circles with a given `radius`, rather
    than points and prevents nodes from overlapping.

    https://github.com/d3/d3-force#collision
    """

    _model_name: str = T.Unicode("CollisionForceModel").tag(sync=True)
    radius: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate node radius",
    ).tag(sync=True)

    strength: Optional[float] = T.Float(
        None,
        allow_none=True,
        min=0,
        max=1,
        default=1,
        help="sets the strength of the force.",
    ).tag(sync=True)

    iterations: Optional[int] = T.Unicode(
        None,
        allow_none=True,
        help="the number of iterations per application to the specified number and returns this force.",
    ).tag(sync=True)


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
        default=0.1,
        help="sets the strength of the force.",
    ).tag(sync=True)
    center_inertia: Optional[float] = T.Float(
        None,
        allow_none=True,
        min=0,
        max=1,
        default=0,
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
    """This behavior enforces constraints for displaying Directed Acyclic Graphs."""

    _model_name: str = T.Unicode("DAGBehaviorModel").tag(sync=True)
    mode: str = T.Enum(values=[m.value for m in DAGMode], default_value=None).tag(
        sync=True
    )
    level_distance: float = T.Float(default_value=None, allow_none=True).tag(sync=True)
    node_filter: str = T.Unicode(
        "",
        help="a nunjucks template to use to calculate if node is part of the DAG layout",
    ).tag(sync=True)
