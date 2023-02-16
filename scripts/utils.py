"""automation utilities for ``ipyforcegraph``"""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import json
import re
import subprocess
import tempfile
from pathlib import Path

from . import project as P

RE_TIMESTAMP = r"\d{4}-\d{2}-\d{2} \d{2}:\d{2} -\d*"
RE_PYTEST_TIMESTAMP = r"on \d{2}-[^\-]+-\d{4} at \d{2}:\d{2}:\d{2}"

PATTERNS = [RE_TIMESTAMP, RE_PYTEST_TIMESTAMP]


def strip_timestamps(*paths, slug="TIMESTAMP"):
    """replace timestamps with a less churn-y value"""
    for path in paths:
        if not path.exists():
            continue

        text = original_text = path.read_text(encoding="utf-8")

        for pattern in PATTERNS:
            if not re.findall(pattern, text):
                continue
            text = re.sub(pattern, slug, text)

        if text != original_text:
            path.write_text(text)


def replace_between_patterns(src: Path, dest: Path, pattern: str):
    """replace the dest file between patterns"""
    print(src, dest)
    src_chunks = src.read_text(encoding="utf-8").split(pattern)
    dest_chunks = dest.read_text(encoding="utf-8").split(pattern)
    dest.write_text(
        "".join([dest_chunks[0], pattern, src_chunks[1], pattern, dest_chunks[2]]),
        encoding="utf-8",
    )


def template_one(src: Path, dest: Path, context=None):
    """Update a file from a template"""
    try:
        import jinja2
    except ImportError:
        print(f"Can't update {src} without jinja2")
        return

    context = context or {}

    tmpl = jinja2.Template(src.read_text(encoding="utf-8"))
    text = tmpl.render(**context)
    dest.write_text(text, encoding="utf-8")


def clean_notebook_metadata(nb_json):
    nb_metadata_keys = list(nb_json["metadata"].keys())
    for key in nb_metadata_keys:
        if key not in P.NB_METADATA_KEYS:
            nb_json["metadata"].pop(key)
    for cell in nb_json["cells"]:
        for clobber in P.CLOBBER_CELL_METADATA_KEYS:
            if clobber in cell["metadata"]:
                cell["metadata"].pop(clobber)


def pretty_markdown_cells(ipynb, nb_json):
    cells = [c for c in nb_json["cells"] if c["cell_type"] == "markdown"]

    if not cells:
        return

    print(f"... prettying {len(cells)} markdown cells of {ipynb.stem}")
    with tempfile.TemporaryDirectory() as td:
        tdp = Path(td)

        files = {}

        for i, cell in enumerate(cells):
            files[i] = tdp / f"{ipynb.stem}-{i:03d}.md"
            files[i].write_text("".join([*cell["source"], "\n"]), encoding="utf-8")

        args = [
            *P.IN_ENV,
            "jlpm",
            "--silent",
            "prettier",
            "--config",
            P.PACKAGE_JSON,
            "--write",
            "--list-different",
        ]

        subprocess.call([*args, tdp])

        for i, cell in enumerate(cells):
            cells[i]["source"] = (
                files[i].read_text(encoding="utf-8").rstrip().splitlines(True)
            )


def notebook_lint(ipynb: Path):
    nb_text = ipynb.read_text(encoding="utf-8")
    nb_json = json.loads(nb_text)

    pretty_markdown_cells(ipynb, nb_json)
    clean_notebook_metadata(nb_json)

    ipynb.write_text(json.dumps(nb_json), encoding="utf-8")

    print(f"... blackening {ipynb.stem}")
    black_args = []
    black_args += ["--quiet"]
    if subprocess.call([*P.IN_ENV, "black", *black_args, ipynb]) != 0:
        return False
