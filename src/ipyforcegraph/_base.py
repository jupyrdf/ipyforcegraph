"""Base widget identification for ipyforcegraph."""
# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import ipywidgets as W
import traitlets as T

from .constants import EXTENSION_NAME, EXTENSION_SPEC_VERSION


class ForceBase(W.Widget):
    _model_name: str = T.Unicode("ForceBaseModel").tag(sync=True)
    _model_module: str = T.Unicode(EXTENSION_NAME).tag(sync=True)
    _model_module_version: str = T.Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)
    _view_module: str = T.Unicode(EXTENSION_NAME).tag(sync=True)
    _view_module_version: str = T.Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)


class Behavior(ForceBase):
    _model_name: str = T.Unicode("BehaviorModel").tag(sync=True)
