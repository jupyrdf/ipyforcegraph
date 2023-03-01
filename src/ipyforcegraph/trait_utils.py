"""Utilities for working with ``traitlets``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any

import traitlets as T


class JSON_TYPES:
    """Known JSON-compatible types."""

    number = "number"
    boolean = "boolean"


def coerce(proposal: T.Bunch, json_type: str) -> Any:
    """Ensure a proposed widget will coerce to the expected type."""
    value = proposal.value

    if value and hasattr(value, "coerce"):
        value.coerce = json_type

    return value
