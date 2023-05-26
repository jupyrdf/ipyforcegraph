import json
from pathlib import Path
import asyncio
from IPython.display import display
import ipywidgets as W

import ipyforcegraph.graphs as G
import ipyforcegraph.sources as S
import ipyforcegraph.behaviors as B

source_data = json.loads(Path("datasets/blocks.json").read_text())

source = S.DataFrameSource(**source_data, node_preserve_columns=["x", "y", "_selected"])

selection, get_data = behaviors = [
    B.NodeSelection(column_name="_selected"),
    B.GraphData(),
]

fg = G.ForceGraph(
    source=source,
    behaviors=behaviors,
    layout=dict(height="100%"),
)

test_result = W.HTML("ready")

display(fg, test_result)

async def test_async():
    print("starting test...", flush=True)
    frontend_nodes_data = None
    retries = 10
    while frontend_nodes_data is None and retries:
        print(f"{retries} retries left...", flush=True)
        retries -= 1
        selection.selected = []
        get_data.capturing = True
        selection.selected = [850]
        await asyncio.sleep(0.25)
        if get_data.sources:
            frontend_nodes_data = get_data.sources[-1].nodes
            if not "_selected" in frontend_nodes_data.columns:
                frontend_nodes_data = None
                continue
            if True not in frontend_nodes_data._selected.unique():
                frontend_nodes_data = None
                continue

    if not retries:
        raise ValueError("failed after 10 retries")
    print(frontend_nodes_data._selected.value_counts())

    id_per_backend_source = source.nodes.id[selection.selected[0]]
    is_selected = frontend_nodes_data._selected == True  # noqa: E712
    id_per_frontend_source = frontend_nodes_data.id[is_selected].iloc[0]

    assert id_per_backend_source == id_per_frontend_source
    assert tuple(source.nodes.id) == tuple(get_data.sources[0].nodes.id)
    print("OK")
