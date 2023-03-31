"""Tests of custom serializers."""
# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.
from typing import Optional

import ipywidgets as W
import pandas as P
import pytest
import traitlets as T

from ipyforcegraph.graphs import ForceGraph
from ipyforcegraph.serializers import dataframe_from_json, dataframe_to_json


def assert_serialization_roundtrip(df: Optional[P.DataFrame], w: W.Widget) -> None:
    """Check that serialization loses no apparent data, ignoring dtype."""
    assert df is not None
    serialized = dataframe_to_json(df, w)
    assert serialized is not None
    unserialized = dataframe_from_json(serialized, w)
    assert df.to_csv() == unserialized.to_csv()


def test_df_serialize_roundtrip() -> None:
    """Validate some cases of serialiazation."""
    fg = ForceGraph()
    src = fg.source
    assert_serialization_roundtrip(src.nodes, src)
    assert_serialization_roundtrip(src.links, src)


def test_df_serialize_none() -> None:
    """Validate some degenerate cases."""
    fg = ForceGraph()
    src = fg.source
    serialized = dataframe_to_json(None, src)
    assert serialized is None
    unserialized = dataframe_from_json(None, src)
    assert unserialized is None

    with pytest.raises(T.TraitError):
        dataframe_to_json(T.Undefined, src)


def test_df_serialize_weird() -> None:
    """Validate some other cases.

    Probably not likely in the wild.
    """
    fg = ForceGraph()
    src = fg.source
    unserialized = dataframe_from_json([{"id": "hello"}], src)
    assert isinstance(unserialized, P.DataFrame)
