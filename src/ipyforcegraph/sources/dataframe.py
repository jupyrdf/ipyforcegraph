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
    _model_name: str = T.Unicode("DataFrameSourceModel").tag(sync=True)
    nodes = TT.PandasType(klass=P.DataFrame, help="the DataFrame of node metadata").tag(
        sync=True, **dataframe_serialization
    )

    links = TT.PandasType(klass=P.DataFrame, help="the DataFrame of edge metadata").tag(
        sync=True, **dataframe_serialization
    )

    link_source_column = T.Unicode(
        "source", help="the name of the column for an edge's source"
    ).tag(sync=True)

    link_target_column = T.Unicode(
        "target", help="the name of the column for an edge's target"
    ).tag(sync=True)

    def __repr__(self):
        """A dumb repr to avoid string nasty pandas comparison stuff."""
        return f"<{self.__class__.__name__}>"
