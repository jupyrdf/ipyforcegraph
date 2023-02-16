"""Main entrypoint for ``ipyforcegraph``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Dict, List

from .constants import EXTENSION_NAME, __version__


def _jupyter_labextension_paths() -> List[Dict[str, str]]:
    from .js import __prefix__

    return [dict(src=str(__prefix__), dest=EXTENSION_NAME)]


__all__ = [
    "__version__",
    "_jupyter_labextension_paths",
]
