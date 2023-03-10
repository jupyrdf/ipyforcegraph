"""Automatically make UI controls for ``Behaviors``."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, Dict, List, Optional, Tuple, Union

import ipywidgets as W
import traitlets as T

from ..graphs import ForceGraph
from ._base import Behavior, Column, DynamicValue, Nunjucks


@W.register
class TextNunjucks(W.VBox):
    """A UI for specifying Behavior attributes using Nunjucks"""

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

    value: Optional[str] = T.Unicode(allow_none=True).tag(sync=True)
    active: W.ToggleButton = T.Instance(
        W.ToggleButton,
        kw=dict(
            description="Active",
            layout=dict(width="auto"),
            value=True,
        ),
    ).tag(sync=True)
    textarea: W.Textarea = T.Instance(
        W.Textarea,
        kw=dict(
            placeholder=PLACEHOLDER,
            layout=dict(width="auto"),
            rows=ROWS,
        ),
    ).tag(sync=True)

    def _update_value(self, _: Optional[T.Bunch] = None) -> None:
        """Update the overall value based on the state of the textarea and activation control."""
        if self.active.value and self.textarea.value:
            self.value = self.textarea.value
        else:
            self.value = None
        # self.value = self.textarea.value if self.active.value else None
        self.textarea.disabled = not self.active.value

    def __init__(self, *args: str, **kwargs: str):
        super().__init__(*args, **kwargs)
        for widget in (self.active, self.textarea):
            widget.observe(self._update_value, "value")

        self.children: tuple = tuple(self.children)
        if not self.children:
            self.children = (self.textarea, self.active)
        self._update_value()


@W.register
class BehaviorAttribute(W.Accordion):
    """A set of controls for setting the value of a Behavior Attribute."""

    BASE_TRAIT_NAMES = tuple(Behavior.class_traits())

    WIDGET_BY_TRAIT = {
        T.Bool: W.Checkbox,
        T.Float: W.FloatText,
        T.Int: W.IntText,
        T.Unicode: W.Text,
        Column: W.Dropdown,
        Nunjucks: TextNunjucks,
    }

    attribute_name: str = T.Unicode().tag(sync=True)

    value: Optional[Union[T.TraitType, DynamicValue]] = T.Union(
        trait_types=[
            T.Unicode(),
            T.Float(),
            T.Int(),
            T.Instance(DynamicValue),
            T.Bool(),
        ],
        allow_none=True,
    ).tag(sync=True)

    @T.observe("selected_index")
    def _update_value(self, *_: T.Bunch) -> None:
        if self.selected_index is None:
            return
        active_child = self.children[self.selected_index]
        value = active_child.value
        if value in (None, False, [], {}, set()):
            self.value = None
            return
        if hasattr(active_child, "options") and value in active_child.options:
            self.value = Column(value)
            return
        if isinstance(active_child, TextNunjucks):
            self.value = Nunjucks(value)
            return
        self.value = value

    @T.validate("children")
    def _validate_children(self, proposal: T.Bunch) -> List[W.DOMWidget]:
        children = proposal.value or []
        for child in children:
            child.observe(self._update_value, "value")
        return children

    @classmethod
    def _get_trait_classes(
        cls, trait: T.TraitType, classes: Optional[List[Any]] = None
    ) -> List[Any]:
        """Recursive method to find all the trait classes allowed."""
        classes = classes or []
        if isinstance(trait, T.Instance):
            return classes + [trait.klass]

        if isinstance(trait, T.Union):
            for trait_type in trait.trait_types:
                classes += cls._get_trait_classes(trait_type)
            return classes

        return classes + [trait.__class__]

    @classmethod
    def make_behavior_controls(
        cls, behavior: Behavior, options: Tuple[str, ...]
    ) -> W.DOMWidget:
        """Make UI controls for a given behavior."""
        behavior_trait_classes = {
            name: cls._get_trait_classes(trait)
            for name, trait in behavior.traits().items()
            if name not in cls.BASE_TRAIT_NAMES
        }

        widgets = {
            label: {f"From {t.__name__}": cls.WIDGET_BY_TRAIT[t] for t in traits}
            for label, traits in behavior_trait_classes.items()
        }

        trait_controls, trait_labels = [], []
        for label, controls in widgets.items():
            titles, children = zip(*controls.items())
            additional_kwargs = [
                dict(options=options) if hasattr(child, "options") else {}
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
            attribute_ui = cls(
                attribute_name=label,
                children=children,
                titles=titles,
            )
            T.dlink((attribute_ui, "value"), (behavior, label))
            trait_controls.append(attribute_ui)
            trait_labels.append(label.title())
        return W.Accordion(
            children=trait_controls,
            titles=trait_labels,
        )


@W.register
class GraphBehaviorsUI(W.Accordion):
    """An auto-generated UI for a ForceGraph Behavior."""

    graph: ForceGraph = T.Instance(ForceGraph).tag(sync=True)
    _cached_widgets: Dict[Behavior, W.DOMWidget] = T.Dict().tag(sync=True)

    def _on_new_behaviors(self, *_: T.Bunch) -> None:
        children = []
        for behavior in self.graph.behaviors:
            behavior_ui = self._cached_widgets.get(behavior, None)

            if behavior_ui is None:
                # TODO: Make this more explicit, maybe add an attribute to the Behavior to indicate if it operates on nodes or links
                context = (
                    "nodes"
                    if "node" in behavior.__class__.__name__.lower()
                    else "links"
                )

                behavior_ui = BehaviorAttribute.make_behavior_controls(
                    behavior,
                    options=tuple(sorted(getattr(self.graph.source, context).columns)),
                )
                self._cached_widgets[behavior] = behavior_ui
            children += [behavior_ui]
        self.children = children
        self.titles = [b.__class__.__name__ for b in self.graph.behaviors]

    @T.observe("graph")
    def _on_new_graph(self, change: T.Bunch) -> None:
        if isinstance(change.old, ForceGraph):
            change.old.unobserve(self._on_new_behaviors)
        if isinstance(change.new, ForceGraph):
            change.new.observe(self._on_new_behaviors, "behaviors")
            self._on_new_behaviors()

    def __init__(self, *args: str, **kwargs: str):
        super().__init__(*args, **kwargs)
        self._on_new_graph(T.Bunch(old=None, new=self.graph))
