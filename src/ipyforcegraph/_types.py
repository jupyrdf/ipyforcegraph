"""Type hint compatibility for `traitlets` and friends."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, Dict, Optional, Union

import traitlets as T

Tstr = T.Unicode[str, Union[str, bytes]]
Tstr_maybe = T.Unicode[Optional[str], Union[str, bytes, None]]

Tint = T.Int[int, int]
Tint_maybe = Optional[int]

Tfloat = T.Float[float, float]
Tfloat_maybe = T.Float[Optional[int], Union[int, float, None]]

Tbool = T.Bool[bool, Union[bool, int]]

Tdict_any = T.Instance[Dict[Any, Any]]
