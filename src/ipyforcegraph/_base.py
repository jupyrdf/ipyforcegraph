"""Base widget identification for ``ipyforcegraph``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import TYPE_CHECKING

import ipywidgets as W
import traitlets as T

from .constants import EXTENSION_NAME, EXTENSION_SPEC_VERSION

if TYPE_CHECKING:
    from . import _types as _t


class ForceBase(W.Widget):
    """The base class for all ``IPyForceGraph`` widgets."""

    _model_name: "_t.Tstr" = T.Unicode("ForceBaseModel").tag(sync=True)
    _model_module: "_t.Tstr" = T.Unicode(EXTENSION_NAME).tag(sync=True)
    _model_module_version: "_t.Tstr" = T.Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)
    _view_module: "_t.Tstr" = T.Unicode(EXTENSION_NAME).tag(sync=True)
    _view_module_version: "_t.Tstr" = T.Unicode(EXTENSION_SPEC_VERSION).tag(sync=True)
