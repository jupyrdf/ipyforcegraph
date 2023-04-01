# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import json
from typing import Any, Dict, Optional

import ipywidgets as W
import numcodecs as N
import numpy as np
import pandas as P
import traitlets as T

HAS_ORJSON = False
try:  # pragma: no cover
    import orjson

    HAS_ORJSON = True
except ImportError:  # pragma: no cover
    pass


def dataframe_to_json(
    value: Optional[P.DataFrame], widget: W.Widget
) -> Optional[Dict[str, memoryview]]:
    """DataFrame JSON serializer."""
    if value is None:
        return None
    if value is T.Undefined:
        raise T.TraitError("Cannot serialize undefined dataframe!")

    df_data = value.replace({np.nan: None}).to_dict(orient="list")

    if HAS_ORJSON:  # pragma: no cover
        df_json = orjson.dumps(df_data)
    else:  # pragma: no cover
        df_json = json.dumps(df_data).encode("utf-8")

    return {"buffer": memoryview(N.zstd.compress(df_json))}


def dataframe_from_json(value: Any, widget: W.Widget) -> P.DataFrame:
    """DataFrame JSON de-serializer."""
    if value is None:
        return None

    if isinstance(value, dict) and "buffer" in value:
        decompressed = N.zstd.decompress(value["buffer"])

        if HAS_ORJSON:  # pragma: no cover
            df_data = orjson.loads(decompressed.decode("utf-8"))
        else:  # pragma: no cover
            df_data = json.loads(decompressed)
    else:
        df_data = value

    return P.DataFrame(df_data)


dataframe_serialization = dict(
    to_json=dataframe_to_json,
    from_json=dataframe_from_json,
)
