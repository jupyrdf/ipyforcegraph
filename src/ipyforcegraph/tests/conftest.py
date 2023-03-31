"""Test fixtures and configuration for ``ipyforcegraph``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

# side-effectful import of ipykernel for a working comm manager
# maybe remove after https://github.com/ipython/comm/pull/13
import ipykernel.ipkernel  # noqa

import platform
import sys

WIN = platform.system() == "Windows"
THREE_EIGHT = sys.version_info < (3, 9)
