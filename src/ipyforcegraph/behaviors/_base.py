"""Base classes for all behaviors and forces."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import traitlets as T

from .._base import ForceBase


class Behavior(ForceBase):
    """The base class for all IPyForceGraph graph behaviors."""

    _model_name: str = T.Unicode("BehaviorModel").tag(sync=True)


class BaseD3Force(Behavior):
    """A base for all ``d3-force-3d`` force wrappers."""

    _model_name: str = T.Unicode("BaseD3ForceModel").tag(sync=True)
    key: str = T.Unicode(
        "unknown",
        help=(
            "force simulation identifier for the force. Must be unique, with "
            "special care taken around the default forces of ``link``, "
            "``charge``, ``center``, and ``dagRadial``."
        ),
    ).tag(sync=True)
    active: bool = T.Bool(True, help="whether the force is currently active").tag(
        sync=True
    )
