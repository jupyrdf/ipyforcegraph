"""Constants for ``ipyforcegraph``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

try:  # pragma: no cover
    from importlib.metadata import version
except ImportError:  # pragma: no cover
    from importlib_metadata import version

NAME = "ipyforcegraph"

__version__ = version(NAME)

#: the name of the front-end package
EXTENSION_NAME = "@jupyrdf/jupyter-forcegraph"

#: the compatibility range for versions of the the front-end package
EXTENSION_SPEC_VERSION = (
    __version__.replace("a", "-alpha").replace("b", "-beta").replace("rc", "-rc")
)

#: columns used internally by ``force-graph`` which should not be overloaded
RESERVED_COLUMNS = {
    "__controlPoints",
    "__indexColor",
    "fx",
    "fy",
    "id",
    "source",
    "target",
    "vx",
    "vy",
    "vz",
    "x",
    "y",
    "z",
}

__all__ = [
    "__version__",
    "EXTENSION_NAME",
    "EXTENSION_SPEC_VERSION",
    "RESERVED_COLUMNS",
]
