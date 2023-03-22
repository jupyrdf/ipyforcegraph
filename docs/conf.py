"""documentation for ``ipyforcegraph``"""

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
    "sphinx.ext.autosummary",
    "sphinx.ext.autosectionlabel",
    "sphinx.ext.extlinks",
    "sphinx.ext.autodoc",
    "autodoc_traits",
    "sphinx_autodoc_typehints",
    "sphinx.ext.viewcode",
    "sphinx.ext.intersphinx",
    "sphinx_copybutton",
    "myst_nb",
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
    "undoc-members": True,
}
inheritance_alias = {}
autosectionlabel_prefix_document = True
myst_heading_anchors = 3

# theme
html_theme = "pydata_sphinx_theme"
html_logo = "_static/wordmark.svg"
html_favicon = "_static/logo.svg"

html_theme_options = {
    "github_url": PROJ["urls"]["Source"],
    "use_edit_page_button": True,
    "show_toc_level": 1,
    "icon_links": [
        {
            "name": "PyPI",
            "url": PROJ["urls"]["PyPI"],
            "icon": "fa-brands fa-python",
        },
        {
            "name": "Conda Forge",
            "url": PROJ["urls"]["Conda Forge"],
            "icon": "./_static/anvil.svg",
            "type": "local",
        },
        {
            "name": "NPM",
            "url": PROJ["urls"]["NPM"],
            "icon": "fa-brands fa-npm",
        },
    ],
    "pygment_light_style": "github-light",
    "pygment_dark_style": "github-dark",
}
html_context = {
    "github_user": "jupyrdf",
    "github_repo": "ipyforcegraph",
    "github_version": "main",
    "doc_path": "docs",
}
html_static_path = [
    "../dist",
    "../build/lite",
    "_static",
]
html_css_files = [
    "theme.css",
]

intersphinx_mapping = {
    "doit": ("https://pydoit.org", None),
    "ipywidgets": ("https://ipywidgets.readthedocs.io/en/latest", None),
    "pandas": ("https://pandas.pydata.org/docs", None),
    "python": ("https://docs.python.org/3", None),
    "traitlets": ("https://traitlets.readthedocs.io/en/stable", None),
}
