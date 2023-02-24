"""Base classes for all behaviors and forces."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, Optional

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


class ShapeBase(ForceBase):
    """A columne from a ``DataFrameSource``."""

    _model_name: str = T.Unicode("ShapeBaseModel").tag(sync=True)


class Column(ForceBase):
    """A column from a ``DataFrameSource``."""

    _model_name: str = T.Unicode("ColumnModel").tag(sync=True)
    value: str = T.Unicode(
        "", help="The name of the column from a ``DataFrameSource``."
    ).tag(sync=True)
    coerce: str = T.Unicode(
        help="name of a JSON Schema ``type`` into which to coerce the final value",
        allow_none=True,
    ).tag(sync=True)

    def __init__(self, value: Optional[str], **kwargs: Any):
        if value is not None:
            kwargs["value"] = value
        super().__init__(**kwargs)


class Nunjucks(ForceBase):
    """A ``nunjucks`` template for customizing a feature."""

    _model_name: str = T.Unicode("NunjucksModel").tag(sync=True)
    value: str = T.Unicode("", help="A ``nunjucks`` template string.").tag(sync=True)
    coerce: str = T.Unicode(
        help="name of a JSON Schema ``type`` into which to coerce the final value",
        allow_none=True,
    ).tag(sync=True)

    def __init__(self, value: Optional[str], **kwargs: Any):
        if value is not None:
            kwargs["value"] = value
        super().__init__(**kwargs)
