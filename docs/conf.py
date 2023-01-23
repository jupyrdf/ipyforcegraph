""" documentation for ipyforcegraph
"""
# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.


from datetime import datetime
from pathlib import Path

try:
    import tomllib
except Exception:
    import tomli as tomllib

# our project data
HERE = Path(__file__).parent
ROOT = HERE.parent

PY_PROJ = tomllib.loads((ROOT / "pyproject.toml").read_text(encoding="utf-8"))
PROJ = PY_PROJ["project"]

# extensions
extensions = [
    "myst_nb",
    "sphinx.ext.autosummary",
    "sphinx.ext.autosectionlabel",
    "sphinx.ext.extlinks",
    "sphinx.ext.autodoc",
    "sphinx_autodoc_typehints",
    "sphinx.ext.viewcode",
    "sphinx.ext.intersphinx",
]

# meta
project = PROJ["name"]
author = PROJ["authors"][0]["name"]
copyright = f"""{datetime.now().year}, {author}"""
release = PROJ["version"]

# paths
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store", ".ipynb_checkpoints"]

# content plugins
autosummary_generate = True
autoclass_content = "both"
autodoc_typehints = "none"
autodoc_default_options = {
    "members": True,
    "show-inheritance": True,
}
inheritance_alias = {}

# theme
html_theme = "pydata_sphinx_theme"
# html_logo = "_static/ipyforcegraph.svg"
# html_favicon = "_static/favicon.ico"

html_theme_options = {
    "github_url": PROJ["urls"]["Source"],
    "use_edit_page_button": True,
    "show_toc_level": 1,
}
html_context = {
    "github_user": "jupyrdf",
    "github_repo": "ipyforcegraph",
    "github_version": "main",
    "doc_path": "docs",
}
html_static_path = [
    "_static",
    "../build/lite",
]
html_css_files = [
    "theme.css",
]

intersphinx_mapping = {
    "ipywidgets": ("https://ipywidgets.readthedocs.io/en/latest", None),
    "pandas": ("https://pandas.pydata.org/docs", None),
    "python": ("https://docs.python.org/3", None),
    "traitlets": ("https://traitlets.readthedocs.io/en/stable", None),
}
