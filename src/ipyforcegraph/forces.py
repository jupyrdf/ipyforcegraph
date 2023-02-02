"""Forces for ``ipyforcegraph``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Optional, Tuple, Union

import ipywidgets as W
import traitlets as T

from ._base import Behavior

@W.register
class ForceBehavior(Behavior):
    key: str = T.Unicode("link").tag(sync=True)
    active: bool = T.Bool(True).tag(sync=True)

    #TODO implement custom force function pass through

@W.register
class ForceLink(ForceBehavior):
    _model_name: str = T.Unicode("ForceLinkModel").tag(sync=True)
    key: str = T.Unicode("link").tag(sync=True)

@W.register
class ForceCenter(ForceBehavior):
    _model_name: str = T.Unicode("ForceCenterModel").tag(sync=True)
    key: str = T.Unicode("center").tag(sync=True)

@W.register
class ForceManyBody(ForceBehavior):
    _model_name: str = T.Unicode("ForceManyBody").tag(sync=True)
    key: str = T.Unicode("charge").tag(sync=True)

@W.register
class ForceRadial(ForceBehavior):
    _model_name: str = T.Unicode("ForceRadial").tag(sync=True)
    key: str = T.Unicode("radial").tag(sync=True)

@W.register
class ForceCollision(ForceBehavior):
    _model_name: str = T.Unicode("ForceCollision").tag(sync=True)
    key: str = T.Unicode("collide").tag(sync=True)