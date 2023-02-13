"""Forces for ``ipyforcegraph``. Using documentation from [d3-forces](https://github.com/d3/d3-force#links).
"""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Dict, Optional

import ipywidgets as W
import traitlets as T

from ._base import Behavior


@W.register
class BaseD3Force(Behavior):
    _model_name: str = T.Unicode("BaseD3ForceModel").tag(sync=True)
    key: str = T.Unicode(
        "link",
        help="force simulation identifier for the force. Must be unique.",
    ).tag(sync=True)
    active: bool = T.Bool(True).tag(sync=True)

    # TODO implement custom force function pass through


@W.register
class GraphForcesBehavior(Behavior):
    """Customize ForceGraph force simulation.

    Holds all kinds of stuff:
    https://github.com/vasturiano/force-graph#force-engine-d3-force-configuration
    """

    _model_name: str = T.Unicode("GraphForcesBehaviorModel").tag(sync=True)

    forces: Dict[str, BaseD3Force] = T.Dict(
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
