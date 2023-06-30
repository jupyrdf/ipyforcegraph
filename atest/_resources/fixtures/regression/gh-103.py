import json
from pathlib import Path
import asyncio
from IPython.display import display
import ipywidgets as W

import ipyforcegraph.graphs as G
import ipyforcegraph.behaviors.shapes as S
import ipyforcegraph.behaviors as B

non_text = S.Text(B.Column("non_text_value"))
text = S.Text(B.Column("text_value"))
ns = S.NodeShapes()

fg = G.ForceGraph(
    behaviors=[ns],
    layout=dict(height="100%"),
    default_node_color="rgba(0,0,0,0)"
)
fg.source.nodes = [{"id": 1, "text_value": "103", "non_text_value": 103}]

test_result = W.HTML("ready")

display(fg, test_result)

async def test_async_non_text():
    ns.shapes = [non_text]
    await asyncio.sleep(0.5)
    test_result.value = " ".join(["OK", "NON-TEXT"])

async def test_async_text():
    ns.shapes = [text]
    await asyncio.sleep(0.5)
    test_result.value = " ".join(["OK", "TEXT"])
