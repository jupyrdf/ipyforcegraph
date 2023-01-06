# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import json

import ipywidgets as W
import numcodecs as N
import pandas as P
import traitlets as T

HAS_ORJSON = False
try:
    import orjson

    HAS_ORJSON = True
except ImportError:
    pass


def dataframe_to_json(value: P.DataFrame, widget: W.Widget):
    """DataFrame JSON serializer."""
    if value is None:
        return None
    if value is T.Undefined:
        raise T.TraitError("Cannot serialize undefined dataframe!")

    df_data = value.to_dict(orient="list")

    if HAS_ORJSON:
        df_json = orjson.dumps(df_data)
    else:
        df_json = json.dumps(df_data).encode("utf-8")

    return {"buffer": memoryview(N.zstd.compress(df_json))}


def dataframe_from_json(value: P.DataFrame, widget: W.Widget):
    """DataFrame JSON de-serializer."""
    if value is None:
        return None

    if HAS_ORJSON:
        df_data = orjson.loads(value)
    else:
        df_data = json.loads(df_data)

    df_json = json.loads(N.zstd.decompress(value["buffer"]))

    return P.DataFrame(df_json)


dataframe_serialization = dict(to_json=dataframe_to_json, from_json=dataframe_from_json)
