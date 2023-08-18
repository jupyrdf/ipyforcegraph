"""Base classes for all behaviors and forces."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any

import ipywidgets as W
import traitlets as T

from .._base import ForceBase
from ..constants import RESERVED_COLUMNS
from ._base import DynamicValue


class WrapperBase(ForceBase):
    """A wrapper for other dynamic values"""

    _model_name: str = T.Unicode("WrapperBaseModel").tag(sync=True)

    wrapped: DynamicValue = T.Union(
        [
            T.Instance(DynamicValue),
            T.Instance("ipyforcegraph.behaviors.wrappers.WrapperBase"),
        ],
        help="the ``DynamicValue`` (or other ``WrapperBase``) wrapped by this wrapper",
    ).tag(sync=True, **W.widget_serialization)


class CaptureAs(WrapperBase):
    """A wrapper that stores dynamically-computed values in the underlying ``node`` or ``link`."""

    _model_name: str = T.Unicode("CaptureAsModel").tag(sync=True)

    column_name: str = T.Unicode(
        allow_none=False, help="name of a column to update with a derived value"
    ).tag(sync=True)

    def __init__(self, column_name: str, wrapped: DynamicValue, **kwargs: Any):
        super().__init__(column_name=column_name, wrapped=wrapped, **kwargs)

    @T.validate("column_name")
    def _validate_column_name(self, proposal: T.Bunch) -> str:
        column_name: str = proposal.value
        if column_name in RESERVED_COLUMNS:
            msg = f"``column_name`` must not be one of {RESERVED_COLUMNS}"
            raise T.TraitError(msg)
        return column_name


class ReplaceCssVariables(WrapperBase):
    """A wrapper that replaces all CSS ``var(--)`` values in the wrapped value."""

    _model_name: str = T.Unicode("ReplaceCssVariablesModel").tag(sync=True)

    def __init__(self, wrapped: DynamicValue, **kwargs: Any):
        super().__init__(wrapped=wrapped, **kwargs)
