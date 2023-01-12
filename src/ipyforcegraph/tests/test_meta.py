# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import ipyforcegraph

try:  # pragma: no cover
    from importlib.metadata import version
except Exception:  # pragma: no cover
    from importlib_metadata import version


def test_meta():
    assert hasattr(ipyforcegraph, "__version__")
    assert ipyforcegraph.__version__ == version("ipyforcegraph")


def test_labext():
    extensions = ipyforcegraph._jupyter_labextension_paths()
    assert len(extensions) == 1, "unexpected number of extensions"
