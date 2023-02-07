# Copyright (c) 2022 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import asyncio
from typing import Any

import ipywidgets as W
import traitlets as T


def wait_for_change(widget: W.Widget, value: Any) -> asyncio.Future[Any]:
    """Initial pattern from
    https://ipywidgets.readthedocs.io/en/stable/examples/Widget%20Asynchronous.html?highlight=async#Waiting-for-user-interaction
    """

    future: asyncio.Future[Any] = asyncio.Future()

    def getvalue(change: T.Bunch) -> None:
        """make the new value available"""
        future.set_result(change.new)

    def unobserve(f: Any) -> None:
        """unobserves the `getvalue` callback"""
        widget.unobserve(getvalue, value)

    future.add_done_callback(unobserve)

    widget.observe(getvalue, value)

    return future
