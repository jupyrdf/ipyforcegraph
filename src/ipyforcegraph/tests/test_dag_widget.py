# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from ..behaviors.forces import DAG


def test_dag() -> None:
    """Basic test for DAG force behavior."""
    behavior = DAG(active=False)

    assert not behavior.active
    assert behavior.mode is None
    assert behavior.mode is DAG.Mode.off.value
    assert behavior.level_distance is None
    assert behavior.node_filter is True
