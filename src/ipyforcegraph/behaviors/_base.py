"""Base classes for all behaviors and forces."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import enum
import json
from typing import Any, Callable, List, Optional, Union

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
Number = Union[int, float]


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


class DataType(enum.Enum):
    """Data types for the ``DynamicValue`` Widget."""

    BOOLEAN = bool
    FLOAT = float
    INTEGER = int
    NUMBER = Number
    REAL = float
    STRING = str

    @staticmethod
    def _to_boolean(value: Any) -> bool:
        if isinstance(value, str):
            value = json.loads(value.lower())
        return bool(value)

    @staticmethod
    def _to_number(value: Any) -> Number:
        try:
            return int(value)
        except ValueError:
            return float(value)

    @property
    def coerce(self) -> Callable:
        """A callable that converts a value to the type specified."""
        self: DataType
        coercion_map = {
            self.BOOLEAN: self._to_boolean,
            self.NUMBER: self._to_number,
        }
        return coercion_map.get(self, self._value_)


class DynamicValue(ForceBase):
    """An abstract class to describe what a Dynamic Widget Trait is and does."""

    _model_name: str = T.Unicode("DynamicValueModel").tag(sync=True)

    value: str = T.Unicode(
        "", help="the source used to compute the value for the trait."
    ).tag(sync=True)

    data_type: DataType = T.Enum(
        DataType, allow_none=True, help="the data type to coerce the value to"
    ).tag(sync=True)
    coerce: str = T.Unicode(
        help="name of a JSON Schema ``type`` into which to coerce the final value",
        allow_none=True,
    ).tag(sync=True)

    def __init__(self, value: Optional[str], **kwargs: Any):
        if value is not None:
            kwargs["value"] = value
        super().__init__(**kwargs)

    @T.validate("value")
    def _coerce_value(self, proposal: T.Bunch) -> Any:
        """Coerce the value to the type specified under ``data_type``."""
        value = proposal.value
        if None in (value, self.data_type):
            return value
        return self.data_type.coerce(value)


class Column(DynamicValue):
    """A column from a ``DataFrameSource``."""

    _model_name: str = T.Unicode("ColumnModel").tag(sync=True)


class Nunjucks(DynamicValue):
    """A ``nunjucks`` template for customizing a feature."""

    _model_name: str = T.Unicode("NunjucksModel").tag(sync=True)


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
