"""automation utilities for ``ipyforcegraph``"""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import json
import re
import subprocess
import tempfile
import textwrap
from functools import lru_cache
from itertools import product
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml

from . import project as P

Paths = List[Path]


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


@lru_cache(1000)
def safe_load(path: Path) -> Dict[str, Any]:
    return yaml.safe_load(path.read_bytes())


def get_spec_stacks(spec_path, platform):
    spec = safe_load(spec_path)
    # initialize the stacks
    base_stack = [spec_path]
    stacks = [base_stack]

    if platform not in spec.get("_platforms", P.ALL_PLATFORMS):
        return

    for inherit in spec.get("_inherit_from", []):
        substacks = [*get_spec_stacks(spec_path.parent / inherit, platform)]
        if substacks:
            stacks = [[*stack, *substack] for substack in substacks for stack in stacks]

    factors = [
        sorted((spec_path.parent / factor).glob("*.yml"))
        for factor in spec.get("_matrix", [])
    ]

    if factors:
        matrix_stacks = []
        for row in product(*factors):
            matrix_stacks += [
                sum(
                    [
                        substack
                        for factor in row
                        for substack in get_spec_stacks(factor, platform)
                    ],
                    [],
                )
            ]
        stacks = [
            [*stack, *matrix_stack]
            for matrix_stack in matrix_stacks
            for stack in stacks
        ]

    yield from stacks


class IndentDumper(yaml.SafeDumper):
    def increase_indent(self, flow=False, indentless=False):
        return super(IndentDumper, self).increase_indent(flow, False)


def merge_envs(env_path: Optional[Path], stack: List[Path]) -> Optional[str]:
    env = {"channels": [], "dependencies": []}

    for stack_yml in stack:
        stack_data = safe_load(stack_yml)
        env["channels"] = stack_data.get("channels") or env["channels"]
        env["dependencies"] += stack_data["dependencies"]

    env["dependencies"] = sorted(set(env["dependencies"]))

    env_str = yaml.dump(env, Dumper=IndentDumper)

    if env_path:
        env_path.write_text(env_str, encoding="utf-8")
        return

    return env_str


def lock_comment(stack: Paths) -> str:
    return textwrap.indent(merge_envs(None, stack), "# ")


def needs_lock(lockfile: Path, stack: Paths) -> bool:
    if not lockfile.exists():
        return True
    lock_text = lockfile.read_text(encoding="utf-8")
    comment = lock_comment(stack)
    return comment not in lock_text


def lock_one(platform: str, lockfile: Path, stack: Paths) -> None:
    if not needs_lock(lockfile, stack):
        print(f"lockfile up-to-date: {lockfile}")
        return

    lock_args = ["conda-lock", "--kind=explicit"]
    comment = lock_comment(stack)
    for env_file in reversed(stack):
        lock_args += ["--file", env_file]
    lock_args += ["--platform", platform]

    if P.LOCK_HISTORY.exists():
        lock_args = [*P.IN_LOCK_ENV, *lock_args]
    elif not P.HAS_CONDA_LOCK:
        print(
            "Can't bootstrap lockfiles without `conda-lock`, please:\n\n\t"
            "mamba install -c conda-forge conda-lock\n\n"
            "and re-run `doit lock`"
        )
        return False

    with tempfile.TemporaryDirectory() as td:
        tdp = Path(td)
        tmp_lock = tdp / f"conda-{platform}.lock"
        subprocess.check_call(list(map(str, lock_args)), cwd=td)
        raw = tmp_lock.read_text(encoding="utf-8").split(P.EXPLICIT)[1].strip()

    lockfile.parent.mkdir(exist_ok=True, parents=True)
    lockfile.write_text("\n".join([comment, P.EXPLICIT, raw, ""]), encoding="utf-8")
