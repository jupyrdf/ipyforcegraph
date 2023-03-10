# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from ..behaviors.forces import DAG


def test_widget_source() -> None:
    behavior = DAG(active=False)

    assert not behavior.active
    assert behavior.node_filter == ""
    assert behavior.mode == None
    assert behavior.mode == DAG.Mode.off
    assert behavior.level_distance == None
