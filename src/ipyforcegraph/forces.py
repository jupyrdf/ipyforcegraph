"""Forces for ``ipyforcegraph``. Using documentation from [d3-forces](https://github.com/d3/d3-force#links).
"""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Optional

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
    forces: dict = T.Dict(
        value_trait=T.Instance(BaseD3Force, allow_none=True),
        help="ForceGraph has `link`, `charge`, and `center`",
    ).tag(sync=True, **W.widget_serialization)


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
    _model_name: str = T.Unicode("CenterForceModel").tag(sync=True)
    key: str = T.Unicode("center").tag(sync=True)
    x: Optional[int] = T.Float(
        None,
        allow_none=True,
        help="sets the x-coordinate of the centering position to the specified number and returns this force.",
    ).tag(sync=True)
    y: Optional[int] = T.Float(
        None,
        allow_none=True,
        help="sets the y-coordinate of the centering position to the specified number and returns this force.",
    ).tag(sync=True)
    z: Optional[int] = T.Float(
        None,
        allow_none=True,
        help="sets the z-coordinate of the centering position to the specified number and returns this force.",
    ).tag(sync=True)


@W.register
class XForce(BaseD3Force):
    _model_name: str = T.Unicode("XForceModel").tag(sync=True)
    x: Optional[int] = T.Float(
        None,
        allow_none=True,
        help="sets the x-coordinate of the centering position to the specified number and returns this force.",
    ).tag(sync=True)


@W.register
class YForce(BaseD3Force):
    _model_name: str = T.Unicode("YForceModel").tag(sync=True)
    y: Optional[int] = T.Float(
        None,
        allow_none=True,
        help="sets the y-coordinate of the centering position to the specified number and returns this force.",
    ).tag(sync=True)


@W.register
class ZForce(BaseD3Force):
    _model_name: str = T.Unicode("ZForceModel").tag(sync=True)
    z: Optional[int] = T.Float(
        None,
        allow_none=True,
        help="sets the z-coordinate of the centering position to the specified number and returns this force.",
    ).tag(sync=True)


@W.register
class ManyBodyForce(BaseD3Force):
    _model_name: str = T.Unicode("ManyBodyForceModel").tag(sync=True)


@W.register
class RadialForce(BaseD3Force):
    """[](https://github.com/d3/d3-force#collision)"""

    _model_name: str = T.Unicode("RadialForceModel").tag(sync=True)


@W.register
class CollisionForce(BaseD3Force):
    """[](https://github.com/d3/d3-force#collision)"""

    _model_name: str = T.Unicode("CollisionForceModel").tag(sync=True)
    radius: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate node radius",
    ).tag(sync=True)
    strength: Optional[str] = T.Unicode(
        None,
        allow_none=True,
        help="a nunjucks template to use to calculate force strength",
    ).tag(sync=True)
    iterations: Optional[int] = T.Unicode(
        None,
        allow_none=True,
        help="the number of iterations per application to the specified number and returns this force.",
    ).tag(sync=True)
