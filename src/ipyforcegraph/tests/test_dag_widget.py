# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from ..behaviors import DAGBehavior


def test_widget_source() -> None:
    behavior = DAGBehavior(active=False)

    assert not behavior.active
    assert behavior.node_filter == ""
    assert behavior.mode == None
    assert behavior.level_distance == None
