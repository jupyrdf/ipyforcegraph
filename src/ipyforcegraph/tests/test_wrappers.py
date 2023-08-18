# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import pytest
import traitlets as T

from ipyforcegraph.behaviors import CaptureAs, Nunjucks, ReplaceCssVariables
from ipyforcegraph.constants import RESERVED_COLUMNS


@pytest.mark.parametrize("column_name", sorted(RESERVED_COLUMNS))
def test_capture_bad_column(column_name: str) -> None:
    """Check that we don't allow setting column names that would break the graph."""
    CaptureAs(f"__foo_{column_name}", Nunjucks("foo"))

    with pytest.raises(T.TraitError, match="column_name"):
        CaptureAs(column_name, Nunjucks("foo"))


def test_replace() -> None:
    """Not sure what to test here."""
    ReplaceCssVariables(Nunjucks("foo"))
