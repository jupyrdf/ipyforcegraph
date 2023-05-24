import json
from pathlib import Path
import asyncio
from IPython.display import display

import ipyforcegraph.graphs as G
import ipyforcegraph.sources as S
import ipyforcegraph.behaviors as B

source_data = json.loads(Path("datasets/blocks.json").read_text())
nodes, links = source_data["nodes"], source_data["links"],

source = S.DataFrameSource(node_preserve_columns=["x", "y", "_selected"])

selection, get_data = behaviors = [
    B.NodeSelection(column_name="_selected"),
    B.GraphData(),
]

fg = G.ForceGraph(
    source=source,
    behaviors=behaviors,
    layout=dict(height="100%"),
)

display(fg)

async def test():
    get_data.capturing = True
    get_data.frame_count = 10
    with source.hold_sync():
        source.nodes, source.links = nodes, links
    await asyncio.sleep(0.25)
    selection.selected = [850]
    await asyncio.sleep(0.5)

    id_per_backend_source = source.nodes.id[selection.selected[0]]

    frontend_nodes_data = get_data.sources[-1].nodes
    is_selected = frontend_nodes_data._selected == True  # noqa: E712
    id_per_frontend_source = frontend_nodes_data.id[is_selected].iloc[0]

    assert id_per_backend_source == id_per_frontend_source
    assert tuple(source.nodes.id) == tuple(get_data.sources[0].nodes.id)
