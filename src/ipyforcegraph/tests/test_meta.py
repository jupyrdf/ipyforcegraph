# Copyright (c) 2022 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import ipyforcegraph

try:
    from importlib.metadata import version
except Exception:
    from importlib_metadata import version


def test_meta():
    assert hasattr(ipyforcegraph, "__version__")
    assert ipyforcegraph.__version__ == version("ipyforcegraph")
