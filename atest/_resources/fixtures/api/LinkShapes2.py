from ipyforcegraph.graphs import WIDGET_CLASS
from ipyforcegraph import behaviors as B
from ipyforcegraph.behaviors import shapes as S

transparent = """rgba(255,255,255,0.0)"""
shape = S.SHAPE_CLASS(fill=transparent)

if isinstance(shape, S.Text):
    shape.text = B.Column("id")

shape.FEATURE = B.Nunjucks(transparent)

ls = B.LinkShapes(shape)
fg = WIDGET_CLASS(behaviors=[ls])
fg.source.nodes = [{"id": "hello"}, {"id": "world"}]
fg.source.links = [
    {"id": "title " * 10, "source": "hello", "target": "world"}
]
fg
