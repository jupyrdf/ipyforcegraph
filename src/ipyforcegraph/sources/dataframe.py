# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.
from __future__ import annotations

from typing import TYPE_CHECKING, Tuple

import ipywidgets as W
import numpy as N
import pandas as P
import traitlets as T
import traittypes as TT

from .._base import ForceBase
from ..serializers import dataframe_serialization

if TYPE_CHECKING:
    from .. import _types as _t


@W.register
class DataFrameSource(ForceBase):
    """A Graph Source that stores the ``nodes`` and ``links`` as :class:`~pandas.DataFrame` instances."""

    _model_name: "_t.Tstr" = T.Unicode("DataFrameSourceModel").tag(sync=True)

    nodes: P.DataFrame = TT.PandasType(
        klass=P.DataFrame, help="the :class:`~pandas.DataFrame` of node data"
    ).tag(sync=True, **dataframe_serialization)

    node_id_column: "_t.Tstr" = T.Unicode(
        "id",
        help="the name of the column for a node's identifier, or 0-based position in the column if `None`",
    ).tag(sync=True)

    node_preserve_columns: Tuple[str, ...] = W.TypedTuple(
        T.Unicode(), help="columns to preserve when updating ``nodes``"
    ).tag(sync=True)

    link_id_column: "_t.Tstr" = T.Unicode(
        "id",
        help="the name of the column for a links's identifier, or 0-based position in the column if `None`",
    ).tag(sync=True)

    link_preserve_columns: Tuple[str, ...] = W.TypedTuple(
        T.Unicode(), help="columns to preserve when updating ``links``"
    ).tag(sync=True)

    links: P.DataFrame = TT.PandasType(
        klass=P.DataFrame, help="the :class:`~pandas.DataFrame` of link data"
    ).tag(sync=True, **dataframe_serialization)

    link_source_column: "_t.Tstr" = T.Unicode(
        "source",
        help="the name of the column for a link's source, defaulting to ``source``",
    ).tag(sync=True)

    link_target_column: "_t.Tstr" = T.Unicode(
        "target",
        help="the name of the column for a link's target, defaulting to ``target``",
    ).tag(sync=True)

    @T.validate("links")
    def _validate_links(self, proposal: T.Bunch) -> P.DataFrame:
        value: P.DataFrame = proposal.value

        if not isinstance(value, P.DataFrame):
            message = f"'links' must be a pandas.DataFrame, not {type(value)}"
            raise T.TraitError(message)

        if self.link_id_column not in value.columns:
            value[self.link_id_column] = N.arange(len(value))

        return value

    def __repr__(self) -> str:
        """A custom representation to avoid ``pandas``/``numpy`` equality issues."""
        name = self.__class__.__name__
        nodes_shape = self.nodes.shape if self.nodes is not None else None
        links_shape = self.links.shape if self.links is not None else None
        return f"{name}(nodes={nodes_shape}, links={links_shape})"
