from typing import Any

import traitlets as T


class JSON_TYPES:
    number = "number"
    boolean = "boolean"


def coerce(proposal: T.Bunch, json_type: str) -> Any:
    value = proposal.value

    if value and hasattr(value, "coerce"):
        value.coerce = json_type

    return value
