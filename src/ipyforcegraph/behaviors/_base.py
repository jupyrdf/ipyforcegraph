"""Base classes for all behaviors and forces."""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

from typing import Any, Optional, Union

import ipywidgets as W
import traitlets as T

from .._base import ForceBase
from ..trait_utils import JSON_TYPES, coerce

TFeature = Optional[Union["Column", "Nunjucks", str]]
TNumFeature = Optional[Union["Column", "Nunjucks", str, int, float]]
TBoolFeature = Optional[Union["Column", "Nunjucks", str, bool]]


class DEFAULT_RANK:
    """Ranks applied to different behaviors: lower values are applied first.

    Ties are resolved by the arbitrary (but monotonically increasing) model id."
    """

    #: selection behaviors should generally come earlier
    selection = 10

    #: shapes should resolve after selection, but before styling of default circles, etc.
    shapes = 20

    #: a default rank for behaviors: ties are resolved by class name, then "age"
    behavior = 100


class Behavior(ForceBase):
    """The base class for all IPyForceGraph graph behaviors."""

    _model_name: str = T.Unicode("BehaviorModel").tag(sync=True)

    rank: int = T.Int(
        DEFAULT_RANK.behavior,
        help=("order in which behaviors are applied: lower numbers are applied first."),
    ).tag(sync=True)


class BaseD3Force(Behavior):
    """A base for all ``d3-force-3d`` force wrappers."""

    _model_name: str = T.Unicode("BaseD3ForceModel").tag(sync=True)
    active: bool = T.Bool(True, help="whether the force is currently active").tag(
        sync=True
    )


class ShapeBase(ForceBase):
    """A base class from which all :mod:`~ipyforcegraph.behaviors.shapes` inherit."""

    _model_name: str = T.Unicode("ShapeBaseModel").tag(sync=True)


class DynamicValue(ForceBase):
    """An abstract class to describe what a Dynamic Widget Trait is and does."""

    _model_name: str = T.Unicode("DynamicModel").tag(sync=True)

    JSON_DATA_TYPES = JSON_TYPES.get_supported_types()

    value: str = T.Unicode(
        "", help="the source used to compute the value for the trait"
    ).tag(sync=True)

    coerce: str = T.Unicode(
        help="name of a JSON Schema ``type`` into which to coerce the final value",
        allow_none=True,
    ).tag(sync=True)

    def __init__(self, value: Optional[str], **kwargs: Any):
        if value is not None:
            kwargs["value"] = value
        super().__init__(**kwargs)

    @T.validate("coerce")
    def _validate_coercer(self, proposal: T.Bunch) -> Optional[str]:
        coerce: Optional[str] = proposal.value
        if coerce is None:
            return None
        if not isinstance(coerce, str):
            raise T.TraitError(f"'coerce' must be a string, not {type(coerce)}")
        coerce = coerce.lower()
        if coerce not in self.JSON_DATA_TYPES:
            raise T.TraitError(
                f"'coerce' must be one of {self.JSON_DATA_TYPES}, not '{coerce}'"
            )
        return coerce


class Column(DynamicValue):
    """A column from a :class:`~ipyforcegraph.sources.dataframe.DataFrameSource`."""

    _model_name: str = T.Unicode("ColumnModel").tag(sync=True)


class Nunjucks(DynamicValue):
    """A `nunjucks template <https://mozilla.github.io/nunjucks/templating.html>`_ for calculating
    dynamic values on the client.

    The syntax is intentionally very similar to
    `jinja2 <https://jinja.palletsprojects.com/en/3.1.x/templates>`_, and a number of extra
    template functions are provided, including the methods and properties in
    `JS Math <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math>`_.

    All the data in the ``source`` is available as ``graphData``, which has ``nodes`` and ``links``.

    Depending on the context, inside of a template, one can use ``node`` or ``link``, which will have
    all their available columns available using the dot notation, e.g., ``node.id``.  In addition,
    ``link`` will have ``source`` and ``target`` as realized ``nodes``.

    For example, to dynamically set the ``attribute`` property of a ``behavior`` in the front-end
    based on the ``id`` property of the source ``node`` of a given ``link``, you would:

    .. code-block:: python

        behavior.attribute = Nunjucks("{{ link.source.id }}")

    With these, and basic template tools, one can generate all kinds of interesting effects.

    .. code-block:: js+jinja
        :caption: color by group

        {{ ["red", "yellow", "blue", "orange", "purple", "magenta"][node.group] }}

    .. code-block:: js+jinja
        :caption: color by out-degree

        {% set n = 0 %}
        {% for link in graphData.links %}
        {% if link.source.id == node.id %}{% set n = n + 1 %}{% endif %}
        {% endfor %}
        {% set c = 256 * (7-n) / 7 %}
        rgb({{ c }},0,0)
    """

    _model_name: str = T.Unicode("NunjucksModel").tag(sync=True)


def _make_trait(
    help: str,
    *,
    default_value: Optional[Any] = None,
    allow_none: bool = True,
    boolish: bool = False,
    by_column: bool = True,
    by_template: bool = True,
    numeric: bool = False,
    stringy: bool = True,
) -> Any:
    """Makes a Trait that can accept a Column, a Nunjuck Template, and a literal."""
    types = (
        ([T.Bool()] if boolish else [])
        + ([T.Unicode()] if stringy else [])
        + ([T.Int(), T.Float()] if numeric else [])
        + ([T.Instance(Column)] if by_column else [])
        + ([T.Instance(Nunjucks)] if by_template else [])
    )

    return T.Union(
        types, help=help, allow_none=allow_none, default_value=default_value
    ).tag(sync=True, **W.widget_serialization)


class HasScale(ShapeBase):
    """A shape that has ``scale_on_zoom``."""

    _model_name: str = T.Unicode("HasScaleModel").tag(sync=True)

    scale_on_zoom: TBoolFeature = _make_trait(
        "whether font size/stroke respects the global scale. Has no impact on `link` shapes.",
        boolish=True,
    )

    @T.validate("scale_on_zoom")
    def _validate_scale_bools(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.boolean)


class HasFillAndStroke(HasScale):
    """A shape that has ``fill`` and ``stroke``."""

    _model_name: str = T.Unicode("HasFillModel").tag(sync=True)
    fill: TFeature = _make_trait("the fill color of a shape")
    stroke: TFeature = _make_trait("the stroke color of a shape")
    stroke_width: TNumFeature = _make_trait("the stroke width of a shape", numeric=True)
    line_dash: TFeature = _make_trait(
        "the dash line pattern of the stroke, e.g., [2, 1] for ``-- -- --``",
        stringy=False,
        by_column=False,
    )

    @T.validate("stroke_width")
    def _validate_has_fill_and_stroke_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)

    @T.validate("line_dash")
    def _validate_has_fill_and_stroke_arrays(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.array)


class HasOffsets(ShapeBase):
    """A shape that can be offset in the horizontal, vertical, or elevation dimensions."""

    _model_name: str = T.Unicode("HasOffsetsModel").tag(sync=True)

    offset_x: float = _make_trait(
        "the relative horizontal offset from the middle of the shape in ``px``",
        numeric=True,
    )
    offset_y: float = _make_trait(
        "the relative vertical offset from the middle of the shape in ``px``",
        numeric=True,
    )
    offset_z: float = _make_trait(
        "the relative elevation offset from the middle of the shape in ``px``",
        numeric=True,
    )

    @T.validate("offset_x", "offset_y", "offset_z")
    def _validate_offset_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)


class HasDimensions(HasFillAndStroke, HasOffsets):
    """A shape that has ``width``, ``height`` and ``depth``."""

    _model_name: str = T.Unicode("HasDimensionsModel").tag(sync=True)

    width: TNumFeature = _make_trait("the width of a shape in ``px``", numeric=True)
    height: TNumFeature = _make_trait("the height of a shape in ``px``", numeric=True)
    depth: TNumFeature = _make_trait("the depth of a shape in ``px``", numeric=True)
    opacity: TNumFeature = _make_trait("the opacity of a shape", numeric=True)

    @T.validate("width", "height", "depth", "opacity")
    def _validate_dimension_numerics(self, proposal: T.Bunch) -> Any:
        return coerce(proposal, JSON_TYPES.number)
