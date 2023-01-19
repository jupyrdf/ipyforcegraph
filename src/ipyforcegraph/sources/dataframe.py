# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import ipywidgets as W
import pandas as P
import traitlets as T
import traittypes as TT

from .._base import ForceBase
from ..serializers import dataframe_serialization


@W.register
class DataFrameSource(ForceBase):
    """A Graph Source that stores the nodes and links as a pandas DataFrame."""

    _model_name: str = T.Unicode("DataFrameSourceModel").tag(sync=True)

    nodes: P.DataFrame = TT.PandasType(
        klass=P.DataFrame, help="the DataFrame of node metadata"
    ).tag(sync=True, **dataframe_serialization)

    node_id_column: str = T.Unicode(
        "id",
        help="the name of the column for a node's identifier, or 0-based position in the column if `None`",
    ).tag(sync=True)

    links: P.DataFrame = TT.PandasType(
        klass=P.DataFrame, help="the DataFrame of link metadata"
    ).tag(sync=True, **dataframe_serialization)

    link_source_column: str = T.Unicode(
        "source",
        help="the name of the column for a link's source, defaulting to `source`",
    ).tag(sync=True)

    link_target_column: str = T.Unicode(
        "target",
        help="the name of the column for a link's target, defaulting to `target`",
    ).tag(sync=True)

    def __repr__(self):
        """A dumb repr to avoid string nasty pandas comparison stuff."""
        name = self.__class__.__name__
        nodes_shape = self.nodes.shape if self.nodes is not None else None
        links_shape = self.links.shape if self.links is not None else None
        return f"{name}(nodes={nodes_shape}, links={links_shape})"
