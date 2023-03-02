from ipyforcegraph.graphs import WIDGET_CLASS
from ipyforcegraph import behaviors as B
from ipyforcegraph.behaviors import shapes as S

transparent = """rgba(0,0,0,0.0)"""
shape = S.Text(
    B.Column("id"),
    fill=transparent
)
shape.FEATURE = B.Nunjucks(transparent)

ns = B.NodeShapes(shape)
fg = WIDGET_CLASS(behaviors=[ns])
fg.source.nodes = [{"id": "hello world"}]
fg
