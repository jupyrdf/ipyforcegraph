import json
from pathlib import Path
import asyncio
from IPython.display import display
import ipywidgets as W

import ipyforcegraph.graphs as G
import ipyforcegraph.sources as S
import ipyforcegraph.behaviors as B

nj = B.Nunjucks("{{ node.user == 'bollwyvl' }}")

source_data = json.loads(Path("datasets/blocks.json").read_text())

source = S.DataFrameSource(**source_data, node_preserve_columns=["x", "y", "_selected"])

(director,) = behaviors = [
    B.GraphDirector(),
]

fg = G.ForceGraph(
    source=source,
    behaviors=behaviors,
    layout=dict(height="100%"),
)

test_result = W.HTML("ready")

display(fg, test_result)

async def test_async_visible():
    director.visible = nj
    await asyncio.sleep(1)
    test_result.value = " ".join(["OK", "VISIBLE"])

async def test_async_padding():
    director.fit_padding = 70
    await asyncio.sleep(1)
    test_result.value = " ".join(["OK", "PADDING"])
