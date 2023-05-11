"""Utilities for working with ``traitlets``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import enum
from typing import Any, Tuple, Type

import traitlets as T


class JSON_TYPES:
    """Known JSON-compatible types."""

    array = "array"
    boolean = "boolean"
    # integer = "integer""
    number = "number"
    # string = "string"

    @classmethod
    def get_supported_types(cls) -> Tuple[str, ...]:
        """Acceptable JSON Types."""
        return tuple(
            key
            for key, value in cls.__dict__.items()
            if not key.startswith("_") and key == value
        )


def coerce(proposal: T.Bunch, json_type: str) -> Any:
    """Ensure a proposed widget will coerce to the expected type."""
    value = proposal.value

    if value and hasattr(value, "coerce"):
        value.coerce = json_type

    return value


def validate_enum(proposal: T.Bunch, of_enum: Type[enum.Enum]) -> Any:
    """Validate a proposal against an enum (or its names)."""
    value = proposal.value
    if isinstance(value, of_enum):
        return value.value

    if any(value == m.value for m in of_enum):
        return value

    raise T.TraitError(f"""'{value}' is not one of {", ".join([*of_enum])}""")
