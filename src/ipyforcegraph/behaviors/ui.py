"""User Interface Helper Widgets."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import List, Dict, Tuple
import ipywidgets as W
import traitlets as T

from ..graphs import ForceGraph
from ._base import Behavior, Column, Nunjucks


@W.register
class TextNunjucks(W.VBox):
    """A UI for specifying Behavior attributes using Nunjucks """

    PLACEHOLDER = """`Nunjucks` take the form of nunjucks templates, this allows
for calculating dynamic values on the client. One can use:

- `node`
  - this will have all of the named columns available to it
- `link`
  - `source` and `target` as realized nodes
- `graphData`
  - `nodes`
  - `links`

The syntax is intentionally very similar to jinja2, and a number of extra
template functions are provided.

With these, and basic template tools, one can generate all kinds of interesting effects.
For the example data above, try these color templates:

- color by group, e.g.,  
  {{ ["red", "yellow", "blue", "orange", "purple", "magenta"][node.group] }}

- color by out-degree, e.g.,
  {% set n = 0 %}
  {% for link in graphData.links %}
    {% if link.source.id == node.id %}{% set n = n + 1 %}{% endif %}
  {% endfor %}
  {% set c = 256 * (7-n) / 7 %}
  rgb({{ c }},0,0)
"""

    ROWS = 10

    value: str = T.Unicode(allow_none=True)
    active: W.ToggleButton = T.Instance(W.ToggleButton, kw=dict(
        description="Active",
        layout=dict(width="auto"),
        value=True,
    ))
    textarea: W.Textarea = T.Instance(W.Textarea, kw=dict(
        placeholder=PLACEHOLDER,
        layout=dict(width="auto"),
        rows=ROWS,
    ))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for widget in (self.active, self.textarea):
            widget.observe(self._update_value, "value")
        self._update_value()

    @T.validate("children")
    def _validate_children(self, proposal) -> Tuple[W.DOMWidget]:
        children = proposal.value
        if not children:
            children = [
                self.textarea,
                self.active,
            ]
        return tuple(children)

    def _update_value(self, *_):
        if self.active.value and self.textarea.value:
            self.value = self.textarea.value
        else:
            self.value = None
        # self.value = self.textarea.value if self.active.value else None
        self.textarea.disabled = not self.active.value


@W.register
class BehaviorAttribute(W.Accordion):
    """A set of controls for setting the value of a Behavior Attribute."""

    attribute_name: str = T.Unicode()
    value: str = T.Unicode(allow_none=True)

    @T.validate("children")
    def _validate_children(self, proposal):
        children = proposal.value or []
        for child in children:
            child.observe(self._update_value, "value")
        return children

    @T.observe("selected_index")
    def _update_value(self, *_):
        if self.selected_index is None:
            return
        value = self.children[self.selected_index].value
        if value in (None, False, [], {}, set()):
            value = ""
        if not isinstance(value, str):
            value = str(value)
        self.value = value


@W.register
class GraphBehaviorsUI(W.Accordion):
    """An auto-generated UI for a ForceGraph Behavior."""

    graph: ForceGraph = T.Instance(ForceGraph)
    title: str = T.Unicode()

    _cached_widgets: Dict[Behavior, W.DOMWidget] = T.Dict()

    BASE_TRAIT_NAMES = tuple(Behavior.class_traits())
    WIDGET_BY_TRAIT = {
        T.Bool: W.Checkbox,
        T.Float: W.FloatText,
        T.Int: W.IntText,
        T.Unicode: W.Text,
        Column: W.Dropdown,
        Nunjucks: TextNunjucks,
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._on_new_graph(T.Bunch(old=None, new=self.graph))

    @T.observe("graph")
    def _on_new_graph(self, change: T.Bunch = None):
        if isinstance(change.old, ForceGraph):
            change.old.unobserve(self._on_new_behaviors)
        if isinstance(change.new, ForceGraph):
            change.new.observe(self._on_new_behaviors, "behaviors")
            self._on_new_behaviors()

    def _on_new_behaviors(self, *_):
        children = []
        for behavior in self.graph.behaviors:
            behavior_ui = self._cached_widgets.get(behavior, None)
            if behavior_ui is None:
                behavior_ui = self._make_behavior_controls(behavior)
                self._cached_widgets[behavior] = behavior_ui
            children += [behavior_ui]
        self.children = children
        self.titles = [b.__class__.__name__ for b in self.graph.behaviors]

    def _make_behavior_controls(self, behavior: Behavior) -> W.DOMWidget:
        behavior_ui = W.Accordion()

        context = "nodes" if "node" in behavior.__class__.__name__.lower() else "links"
        columns = tuple(sorted(getattr(self.graph.source, context).columns))

        behavior_trait_classes = {
            name: [t for t in self.get_trait_classes(trait)]
            for name, trait in behavior.traits().items()
            if name not in self.BASE_TRAIT_NAMES
        }

        widgets = {
            label: {f"From {t.__name__}": self.WIDGET_BY_TRAIT[t] for t in traits}
            for label, traits in behavior_trait_classes.items()
        }

        for idx, (label, controls) in enumerate(widgets.items()):
            titles, children = zip(*controls.items())
            additional_kwargs = [
                dict(options=columns) if isinstance(child, Column) else {}
                for child in children
            ]
            children = [
                # This is where the UI controls get instantiated
                child(
                    layout=dict(width="auto"),
                    **kwargs,
                )
                for child, kwargs in zip(children, additional_kwargs)
            ]
            attribute_ui = BehaviorAttribute(
                attribute_name=label,
                children=children,
                titles=titles,
            )
            T.dlink((attribute_ui, "value"), (behavior, label))
            behavior_ui.children += (attribute_ui,)
            behavior_ui.set_title(idx, label.title())
        return behavior_ui

    def get_trait_classes(self, trait: T.TraitType, classes: list = None) -> List[T.HasTraits]:
        """Recursive method to find all the trait classes allowed."""
        classes = classes or []
        if isinstance(trait, T.Instance):
            return classes + [trait.klass]

        if isinstance(trait, T.Union):
            for trait_type in trait.trait_types:
                classes += self.get_trait_classes(trait_type)
            return classes

        return classes + [trait.__class__]
