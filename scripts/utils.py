"""automation utilities for ``ipyforcegraph``"""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import difflib
import json
import re
import shutil
import subprocess
import tempfile
import textwrap
import typing
from functools import lru_cache
from hashlib import sha256
from itertools import product
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml

from . import project as P

Paths = List[Path]


RE_TIMESTAMP = r"\d{4}-\d{2}-\d{2} \d{2}:\d{2} -\d*"
RE_PYTEST_TIMESTAMP = r"on \d{2}-[^\-]+-\d{4} at \d{2}:\d{2}:\d{2}"
RE_XML_DECL = r"<\?xml.*?>"

PATTERNS = [RE_TIMESTAMP, RE_PYTEST_TIMESTAMP]
XP_JUPYTER_STDERR = """//*[@data-mime-type="application/vnd.jupyter.stderr"]"""
XP_BAD_XREF = """//code[contains(@class, "xref")][not(parent::a)]"""


def replace_between_patterns(src: Path, dest: Path, pattern: str):
    """replace the dest file between patterns"""
    print(src, dest)
    src_chunks = src.read_text(**P.UTF8).split(pattern)
    dest_chunks = dest.read_text(**P.UTF8).split(pattern)
    dest.write_text(
        "".join([dest_chunks[0], pattern, src_chunks[1], pattern, dest_chunks[2]]),
        **P.UTF8,
    )


def fix_line_endings(filepath: Path):
    """Convert any CRLF line endings to LF."""
    print(f"... fixing line endings for {filepath.stem}")
    filepath.write_bytes(filepath.read_bytes().replace(b"\r\n", b"\n"))


def template_one(src: Path, dest: Path, context=None):
    """Update a file from a template"""
    try:
        import jinja2
    except ImportError:
        print(f"Can't update {src} without jinja2")
        return

    context = context or {}

    tmpl = jinja2.Template(src.read_text(**P.UTF8))
    text = tmpl.render(**context)
    dest.write_text(text, **P.UTF8)
    fix_line_endings(dest)


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
            files[i].write_text("".join([*cell["source"], "\n"]), **P.UTF8)

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
            cells[i]["source"] = files[i].read_text(**P.UTF8).rstrip().splitlines(True)


def notebook_lint(ipynb: Path):
    nb_text = ipynb.read_text(**P.UTF8)
    nb_json = json.loads(nb_text)

    pretty_markdown_cells(ipynb, nb_json)
    clean_notebook_metadata(nb_json)

    ipynb.write_text(json.dumps(nb_json), **P.UTF8)

    print(f"... blackening {ipynb.stem}")
    black_args = []
    black_args += ["--quiet"]
    if subprocess.call([*P.IN_ENV, "black", *black_args, ipynb]) != 0:
        return False


def fix_windows_line_endings(max_chunk_size: int = 8000):
    """Break filelist into chunks for dos2unix call that converts CRLF to LF."""
    num_files = len(P.ALL_DOS2UNIX)
    _chunks = [P.ALL_DOS2UNIX]
    while any(
        len(" ".join([str(c) for c in chunk])) > max_chunk_size for chunk in _chunks
    ):
        num_files = int(num_files / 2)
        if num_files < 1:
            raise ValueError("Error finding dos2unix file chunk size.")
        _chunks = [
            P.ALL_DOS2UNIX[i : i + num_files]
            for i in range(0, len(P.ALL_DOS2UNIX), num_files)
        ]
    print(
        f"Split {len(P.ALL_DOS2UNIX)} files into chunks of {num_files} for linting command."
    )
    for chunk in _chunks:
        if subprocess.call([*P.IN_ENV, "dos2unix", "--quiet", *chunk]) != 0:
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


def merge_envs(
    env_path: Optional[Path],
    stack: List[Path],
    remove_specs: Optional[List[str]] = None,
) -> Optional[str]:
    env = {"channels": [], "dependencies": []}
    remove_specs = remove_specs or []
    raw_deps = []
    for stack_yml in stack:
        stack_data = safe_load(stack_yml)
        env["channels"] = stack_data.get("channels") or env["channels"]
        raw_deps += stack_data["dependencies"]

    raw_deps = sorted(set(raw_deps))
    for dep in raw_deps:
        if any(re.search(pattern, dep) for pattern in remove_specs):
            continue
        env["dependencies"].append(dep)

    env_str = yaml.dump(env, Dumper=IndentDumper)

    if env_path:
        env_path.write_text(env_str, **P.UTF8)
        return

    return env_str


def lock_comment(stack: Paths) -> str:
    return textwrap.indent(merge_envs(None, stack), "# ")


def needs_lock(lockfile: Path, stack: Paths) -> bool:
    if not lockfile.exists():
        return True
    lock_text = lockfile.read_text(**P.UTF8)
    comment = lock_comment(stack)
    return comment not in lock_text


def lock_one(platform: str, lockfile: Path, stack: Paths) -> None:
    if not needs_lock(lockfile, stack):
        print(f"lockfile up-to-date: {lockfile}")
        return

    lock_args = ["conda-lock", "--kind=explicit"]
    comment = lock_comment(stack)
    patches = []
    for env_file in stack:
        lock_args += ["--file", env_file]
        env_data = safe_load(env_file)
        patches += env_data.get("_patches", [])
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
        str_args = list(map(str, lock_args))
        print(">>>", " ".join(str_args), "\n")
        subprocess.check_call(str_args, cwd=td)
        raw = tmp_lock.read_text(**P.UTF8).split(P.EXPLICIT)[1].strip()

    if patches:
        print(f"   ... applying {len(patches)} patches")
        lines = raw.splitlines()
        for patch in patches:
            print(f"""   ... looking to patch {patch["old"]}...""")
            index = lines.index(patch["old"])
            lines[index] = patch["new"]
        raw = "\n".join(lines)

    lockfile.parent.mkdir(exist_ok=True, parents=True)
    lockfile.write_text("\n".join([comment, P.EXPLICIT, raw, ""]), **P.UTF8)


def naive_string_sort_key(value: str):
    """provide a best-effort string sort key that matches some other tools."""
    return (value.lower(), value[0] != value[0].lower(), value[1] != value[1].lower())


def sort_unique(path: Path):
    """ensure a file contains only unique, sorted lines"""
    old_text = path.read_text(**P.UTF8)
    old_lines = old_text.strip().splitlines()
    stripped_lines = {line.strip() for line in old_lines if line.strip()}
    new_lines = sorted(stripped_lines, key=naive_string_sort_key)
    new_text = "\n".join(new_lines + [""])
    if new_text != old_text:
        diff = difflib.unified_diff(old_lines, new_lines, "BEFORE", "AFTER")
        print("\n".join(diff))
        path.write_text(new_text, **P.UTF8)
        print(f"sorted and deduplicated {path}")


def html_expect_xpath_matches(html: Path, xpath: str, expected: int, label: str):
    import lxml.html

    tree = lxml.html.fromstring(html.read_bytes())
    matches = tree.xpath(xpath)
    if matches:
        print(f"{html} contains {label}:")
        for match in matches:
            print(match.text_content(), "\n")

    return len(matches) == expected


def clean_some(*paths: Path):
    for path in paths:
        if path.is_dir():
            shutil.rmtree(path)
        elif path.exists():
            path.unlink()


def minimize_one_svg(
    src: Path,
    dest: Path,
    strip_decl: Optional[bool] = None,
    strip_svg_attrs: Optional[List[str]] = None,
) -> bool:
    print(f"optimizing {src.relative_to(P.ROOT)} to {dest.relative_to(P.ROOT)}")
    args = [
        *P.IN_ENV,
        "scour",
        "-i",
        str(src),
        "-o",
        str(dest),
        "--enable-viewboxing",
        "--enable-id-stripping",
        "--enable-comment-stripping",
        "--shorten-ids",
        "--indent=none",
    ]

    subprocess.call(args) == 0

    if not dest.exists():
        return False

    old_text = dest.read_text(**P.UTF8)
    new_text = old_text

    if strip_svg_attrs:
        from lxml import etree as ET

        svg = ET.fromstring(old_text.encode("utf-8"))
        for attr in strip_svg_attrs:
            stripped = svg.attrib.pop(attr, None)
            print(f"""... stripping <svg {attr}="{stripped}">""")

        new_text = ET.tostring(svg).decode("utf-8")

    if strip_decl:
        print("... stripping <?xml?> declaration")
        new_text = re.sub(RE_XML_DECL, "", new_text)

    if old_text != new_text:
        dest.write_text(new_text, **P.UTF8)


def pip_check():
    proc = subprocess.Popen(
        [*P.IN_ENV, *P.PIP, "check"], stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    proc.wait()
    outs, errs = proc.communicate()
    all_lines = [
        *outs.decode("utf-8").strip().splitlines(),
        *errs.decode("utf-8").strip().splitlines(),
    ]
    error_lines = [
        line
        for line in all_lines
        if line.strip()
        and not any(re.search(skip, line) for skip in P.PIP_CHECK_IGNORE)
    ]
    if error_lines:
        print(error_lines)
    return not error_lines


def write_github_summary(summary_text: str) -> None:
    summary = Path(P.GITHUB_STEP_SUMMARY)
    if not summary.parent.exists():
        summary.parent.mkdir(exist_ok=True)
    summary.write_text(summary_text, **P.UTF8)
    print(f"... wrote to {P.GITHUB_STEP_SUMMARY}")


def atest_cov_js():
    all_js_cov = sorted(P.ATEST_OUT.glob("*/jscov/*.json"))

    if not all_js_cov:
        print("No JS coverage from atest")
        return False

    with tempfile.TemporaryDirectory() as td:
        for js_cov in all_js_cov:
            shutil.copy2(js_cov, Path(td) / js_cov.name)

        report_args = [
            "jlpm",
            "--silent",
            "nyc",
            "report",
            f"--temp-dir={td}",
        ]

        if P.GITHUB_STEP_SUMMARY:
            out = subprocess.check_output([*report_args, "--reporter=text"], **P.UTF8)
            trimmed = "\n".join(out.strip().splitlines()[1:-1]).replace("-|", "-:|")
            summary_text = trimmed
            out = subprocess.check_output(
                [*report_args, "--reporter=text-summary"], **P.UTF8
            )
            summary_text += "\n\n"
            summary_text += "Metric | Percent | Covered | Total |\n-:|-:|-:|-:|\n"
            for line in out.splitlines():
                if ":" in line:
                    summary_text += (
                        line.replace(":", "|")
                        .replace("(", "|")
                        .replace(")", "")
                        .replace("%", "")
                        .replace("/", " | ")
                        + "\n"
                    )

            write_github_summary(summary_text)

        rc = subprocess.call(
            [
                *report_args,
                f"--report-dir={P.ATEST_COV_JS}",
                "--check-coverage",
                f"--lines={P.JS_COV_LINE_THRESHOLD}",
                f"--branches={P.JS_COV_BRANCH_THRESHOLD}",
            ]
        )

    return rc == 0


def atest_cov_py():
    all_py_cov = sorted(P.ATEST_OUT.glob("*/pabot_results/*/pycov/.coverage*"))

    if not all_py_cov:
        print("No Python coverage from atest")
        return False
    with tempfile.TemporaryDirectory() as td:
        subprocess.call(["coverage", "combine", "--keep", *all_py_cov], cwd=td)
        subprocess.call(
            [
                "coverage",
                "html",
                "--title=atest",
                "--show-contexts",
                "--omit",
                "*/tests/*",
                f"--directory={P.ATEST_COV_PY}",
            ],
            cwd=td,
        )
        rc = subprocess.call(
            [
                "coverage",
                "report",
                "--omit",
                "*/tests/*",
                "--show-missing",
                "--skip-covered",
                f"--fail-under={P.ATEST_PY_COV_THRESHOLD}",
            ],
            cwd=td,
        )
    return rc == 0


def all_cov():
    all_py_cov = [
        P.UTEST_COV_DATA,
        *sorted(P.ATEST_OUT.glob("*/pabot_results/*/pycov/.coverage*")),
    ]
    with tempfile.TemporaryDirectory() as td:
        subprocess.call(["coverage", "combine", "--keep", *all_py_cov], cwd=td)
        subprocess.call(
            [
                "coverage",
                "html",
                "--title=ALL",
                "--show-contexts",
                f"--directory={P.ALL_COV_PY}",
            ],
            cwd=td,
        )
        report_args = [
            "coverage",
            "report",
            "--show-missing",
            "--skip-covered",
        ]

        rc = subprocess.call(
            [*report_args, f"--fail-under={P.ALL_PY_COV_THRESHOLD}"],
            cwd=td,
        )

        if P.GITHUB_STEP_SUMMARY:
            out = subprocess.check_output([*report_args, "--format=markdown"], **P.UTF8)
            write_github_summary(out.strip())

    return rc == 0


def hash_files(
    hash_file: Path,
    hash_deps: List[Path],
    quiet: Optional[bool] = False,
    root: Optional[Path] = None,
):
    root = root or hash_file.parent
    if hash_file.exists():
        hash_file.unlink()

    lines = []

    for p in hash_deps:
        lines += [
            "  ".join(
                [sha256(p.read_bytes()).hexdigest(), p.relative_to(root).as_posix()]
            )
        ]

    output = "\n".join(lines)
    hash_file.write_text(output, **P.UTF8)
    if not quiet:
        print(output)


def gather_css_variables(out_txt: Path, css_src: typing.List[Path]):
    all_vars = []

    if not css_src:
        print("Can't extract CSS variables without source")
        return False

    print(f"    ... looking for CSS vars in {len(css_src)} paths")

    re_var_def = r"""(--(jp|md)-[^:;`'"\s\(\)\{\}]+(?=\s*:))"""
    re_var_ref = r"""(var\((--.*?)\))"""

    for path in css_src:
        raw = path.read_text(**P.UTF8)
        path_vars = [m[0] for m in re.findall(re_var_def, raw, flags=re.M)]
        path_vars += [m[1] for m in re.findall(re_var_ref, raw, flags=re.M)]
        path_vars = sorted(set(path_vars))
        if path_vars:
            print(f"        ... {path} {len(path_vars)} vars")
            all_vars = sorted(set([*all_vars, *path_vars]))

    print(f"    ... wrote {len(all_vars)} vars to {out_txt}")

    out_txt.write_text("\n".join([*all_vars, ""]), **P.UTF8)
