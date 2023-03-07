"""Base classes for all behaviors and forces."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, List, Optional, Union

import ipywidgets as W
import traitlets as T

from .._base import ForceBase

__all__ = (
    "_make_trait",
    "BaseD3Force",
    "Behavior",
    "Column",
    "Nunjucks",
    "ShapeBase",
    "TBoolFeature",
    "TFeature",
    "TNumFeature",
)

TFeature = Optional[Union["Column", "Nunjucks", str]]
TNumFeature = Optional[Union["Column", "Nunjucks", str, int, float]]
TBoolFeature = Optional[Union["Column", "Nunjucks", str, bool]]


class Behavior(ForceBase):
    """The base class for all IPyForceGraph graph behaviors."""

    _model_name: str = T.Unicode("BehaviorModel").tag(sync=True)


class BaseD3Force(Behavior):
    """A base for all ``d3-force-3d`` force wrappers."""

    _model_name: str = T.Unicode("BaseD3ForceModel").tag(sync=True)
    active: bool = T.Bool(True, help="whether the force is currently active").tag(
        sync=True
    )


class ShapeBase(ForceBase):
    """A column from a ``DataFrameSource``."""

    _model_name: str = T.Unicode("ShapeBaseModel").tag(sync=True)


class DynamicValue(ForceBase):
    """An abstract class to describe what a Dynamic Widget Trait is and does."""

    _model_name: str = T.Unicode("DynamicValueModel").tag(sync=True)

    value: str = T.Unicode(
        "", help="The source used to compute the value for the trait."
    ).tag(sync=True)

    def __init__(self, value: Optional[str], **kwargs: Any):
        if value is not None:
            kwargs["value"] = value
        super().__init__(**kwargs)


class Column(DynamicValue):
    """A column from a ``DataFrameSource``."""

    _model_name: str = T.Unicode("ColumnModel").tag(sync=True)


class Nunjucks(DynamicValue):
    """A ``nunjucks`` template for customizing a feature."""

    _model_name: str = T.Unicode("NunjucksModel").tag(sync=True)

    coerce: str = T.Unicode(
        help="Name of a JSON Schema ``type`` into which to coerce the final value",
        allow_none=True,
    ).tag(sync=True)


def _make_trait(
    help: str,
    *,
    allow_none: bool = True,
    boolish: bool = False,
    by_column: bool = True,
    by_nunjuck: bool = True,
    numeric: bool = False,
    stringy: bool = True,
) -> Any:
    """Makes a Trait that can accept a Column, a Nunjuck Template, and a literal."""
    types: List[Any] = ([T.Instance(Column)] if by_column else []) + (
        [T.Instance(Nunjucks)] if by_nunjuck else []
    )
    if stringy:
        types += [T.Unicode()]
    if numeric:
        types += [T.Int(), T.Float()]
    if boolish:
        types += [T.Bool()]

    return T.Union(types, help=help, allow_none=allow_none).tag(
        sync=True, **W.widget_serialization
    )
