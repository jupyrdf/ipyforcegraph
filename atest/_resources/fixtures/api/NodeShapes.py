from ipyforcegraph.graphs import WIDGET_CLASS
from ipyforcegraph import behaviors as B
from ipyforcegraph.behaviors import shapes as S

transparent = """rgba(0,0,0,0.0)"""
shape = S.SHAPE_CLASS(fill=transparent)

if isinstance(shape, S.Text):
    shape.text = B.Column("id")

shape.FEATURE = B.Nunjucks(transparent)

ns = B.NodeShapes(shape)
fg = WIDGET_CLASS(behaviors=[ns])
fg.source.nodes = [{"id": "hello world"}]
fg
