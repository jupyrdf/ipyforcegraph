"""important project paths

this should not import anything not in py36+ stdlib, or any local paths
"""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import json
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    print("python-dotenv appears to not be installed: .env will be ignored")


try:
    import tomllib
except Exception:
    import tomli as tomllib

PY_PKG = "ipyforcegraph"

# platform
PLATFORM = os.environ.get("FAKE_PLATFORM", platform.system())
THIS_SUBDIR = {
    "Windows": "win-64",
    "Darwin": "osx-64",
    "Linux": "linux-64",
}.get(PLATFORM)
WIN = PLATFORM == "Windows"
OSX = PLATFORM == "Darwin"
LINUX = PLATFORM == "Linux"
UNIX = not WIN
HAS_CONDA_LOCK = shutil.which("conda-lock")
UTF8 = dict(encoding="utf-8")
PY_MAJOR = ".".join(map(str, sys.version_info[:2]))


def _get_boolish(name, default="false"):
    return bool(json.loads(os.environ.get(name, default).lower()))


CI = _get_boolish("CI")
WIN_CI = _get_boolish("WIN_CI")
TESTING_IN_CI = _get_boolish("TESTING_IN_CI")
BUILDING_IN_CI = _get_boolish("BUILDING_IN_CI")
IN_BINDER = _get_boolish("IN_BINDER")
IN_RTD = _get_boolish("READTHEDOCS")
PYTEST_ARGS = json.loads(os.environ.get("PYTEST_ARGS", "[]"))
TOTAL_COVERAGE = _get_boolish("TOTAL_COVERAGE")

# CI jank
SKIP_CONDA_PREFLIGHT = _get_boolish("SKIP_CONDA_PREFLIGHT")
FORCE_SERIAL_ENV_PREP = _get_boolish("FORCE_SERIAL_ENV_PREP", "true")
# one of: None, wheel or sdist
INSTALL_ARTIFACT = os.environ.get("INSTALL_ARTIFACT")
UTEST_PROCESSES = os.environ.get(
    "UTEST_PROCESSES", os.environ.get("ATEST_PROCESSES", "")
)
IPYFORCEGRAPH_PY = os.environ.get("IPYFORCEGRAPH_PY", "py3.11")
IPYFORCEGRAPH_LAB = os.environ.get("IPYFORCEGRAPH_LAB", "lab3.6")

# find root
SCRIPTS = Path(__file__).parent.resolve()
ROOT = SCRIPTS.parent

# git
COMMIT = subprocess.check_output(["git", "rev-parse", "HEAD"]).decode("utf-8").strip()
SOURCE_DATE_EPOCH = (
    subprocess.check_output(["git", "log", "-1", "--format=%ct"])
    .decode("utf-8")
    .strip()
)

# top-level stuff
LICENSE = ROOT / "LICENSE.txt"
PY_PROJ = ROOT / "pyproject.toml"
PY_PROJ_DATA = tomllib.loads(PY_PROJ.read_text(encoding="utf-8"))
NODE_MODULES = ROOT / "node_modules"
PACKAGE_JSON = ROOT / "package.json"
JS_PACKAGE_DATA = json.loads(PACKAGE_JSON.read_text(encoding="utf-8"))
JS_NEEDS_INSTALL_KEYS = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "version",
]
JS_PKG = JS_PACKAGE_DATA["name"]
JS_VERSION = JS_PACKAGE_DATA["version"]
YARN_INTEGRITY = NODE_MODULES / ".yarn-integrity"
YARN_LOCK = ROOT / "yarn.lock"
GH = ROOT / ".github"
DODO = ROOT / "dodo.py"
BUILD = ROOT / "build"
DIST = ROOT / "dist"
ENVS = ROOT / "envs"
CHANGELOG = ROOT / "CHANGELOG.md"
CONDARC = GH / ".condarc"
README = ROOT / "README.md"
DOCS = ROOT / "docs"
BINDER = ROOT / ".binder"
POSTBUILD = BINDER / "postBuild"
LITE = ROOT / "lite"
LITE_CONFIG = LITE / "jupyter_lite_config.json"
IGNORED_VULNERABILITIES = ROOT / "ignored-vulnerabilities.json"
PAGES_LITE = ROOT / "pages-lite"


# envs
ALL_PLATFORMS = ["linux-64", "osx-64", "win-64"]
ENV_SPECS = GH / "specs"
BINDER_ENV_YAML = BINDER / "environment.yml"
DOCS_ENV_YAML = DOCS / "environment.yml"
ALL_ENVS_YAML = sorted(ENV_SPECS.glob("*-environment.yml"))
LOCK_ENV_YAML = GH / "lock-environment.yml"
PY_SPECS = sorted(ENV_SPECS.glob("py/*.yml"))
LAB_SPECS = sorted(ENV_SPECS.glob("lab/*.yml"))
SUBDIR_SPECS = sorted(ENV_SPECS.glob("subdir/*.yml"))
SUBDIR_LOCK_SPECS = sorted(ENV_SPECS.glob("subdir-lock/*.yml"))

EXPLICIT = "@EXPLICIT"
LOCKS = GH / "locks"
PIP_BUILD_ENV = GH / "requirements-build.txt"
LOCKFILE = (
    LOCKS / f"{THIS_SUBDIR}_dev_{IPYFORCEGRAPH_LAB}_{IPYFORCEGRAPH_PY}.conda.lock"
)
LOCK_LOCKFILE = LOCKS / f"{THIS_SUBDIR}_lock.conda.lock"
USE_LOCK_ENV = not (CI or IN_RTD or IN_BINDER)
ENV = (
    Path(sys.prefix)
    if IN_RTD or IN_BINDER or CI
    else ROOT / f"envs/{IPYFORCEGRAPH_PY}_{IPYFORCEGRAPH_LAB}"
)
LOCK_ENV = ROOT / "envs/lock"

CONDA = shutil.which("conda") or shutil.which("conda.exe")
CONDA_RUN = [CONDA, "run", "--live-stream", "--prefix"]
MAMBA_CREATE = ["mamba", "create", "-y", "--prefix"]

if BUILDING_IN_CI:
    IN_ENV = []
    HISTORY = PIP_BUILD_ENV
else:
    IN_ENV = [*CONDA_RUN, ENV]
    IN_LOCK_ENV = [*CONDA_RUN, LOCK_ENV]
    HISTORY = ENV / "conda-meta/history"
    LOCK_HISTORY = LOCK_ENV / "conda-meta/history"

# tools
PY = ["python"]
PYM = [*PY, "-m"]
PIP = [*PYM, "pip"]
PIP_CHECK_IGNORE = [
    r"conda\.cli\.main_run",
    r"No broken requirements found",
    r"sphinx-rtd-theme.*docutils",
]

JLPM = ["jlpm"]
JLPM_INSTALL = [*JLPM, "--prefer-offline"]
PREFLIGHT = [*PYM, "scripts.preflight"]
LAB_EXT = ["jupyter", "labextension"]
CONDA_BUILD = ["conda-build"]
LAB = ["jupyter", "lab"]
PRETTIER = [*JLPM, "--silent", "prettier"]
JUPYTERLAB_EXE = [*IN_ENV, "jupyter-lab", "--no-browser", "--debug"]

# python stuff
PY_SRC = ROOT / "src" / PY_PKG
PY_EXT = ROOT / "src/_d/share/jupyter/labextensions/@jupyrdf/jupyter-forcegraph/"
PY_PACKAGE_JSON = PY_EXT / "package.json"
PY_GRAPH_CLASSES = ["ForceGraph", "ForceGraph3D"]

# docs
SPHINX_ARGS = json.loads(os.environ.get("SPHINX_ARGS", """["-W", "--keep-going"]"""))
LITE_JSON = [*LITE.glob("*.json")]
LOGO_SVG = DOCS / "_static/logo.svg"
DOCS_BUILD = BUILD / "docs"
DOCS_CONF = DOCS / "conf.py"
DICTIONARY = DOCS / "dictionary.txt"
ALL_SPELL = BUILD / "spell/ALL.fail"
LITE_BUILD = BUILD / "lite"
LITE_SHA256SUMS = LITE_BUILD / "SHA256SUMS"


# js stuff
JS_LIB = ROOT / "lib"
TSBUILDINFO = BUILD / ".src.tsbuildinfo"
JS_LIB_INDEX_JS = JS_LIB / "index.js"
TS_SRC = ROOT / "js"
TS_TOKENS = TS_SRC / "tokens.ts"
STYLE = ROOT / "style"
ALL_TSCONFIG = [
    ROOT / "tsconfigbase.json",
    ROOT / "tsconfig.json",
    TS_SRC / "tsconfig.json",
]

# tests
EXAMPLES = ROOT / "examples"
EXAMPLE_IPYNB = [
    p
    for p in EXAMPLES.glob("*.ipynb")  # only look in the root for top-level examples
    if ".ipynb_checkpoints" not in str(p) and "untitled" not in str(p).lower()
]
EXAMPLE_JSON = [
    p for p in EXAMPLES.rglob("*.json") if ".ipynb_checkpoints" not in str(p)
]
EXAMPLE_PY = [*EXAMPLES.rglob("*.py")]
EXAMPLE_INDEX = EXAMPLES / "_index.ipynb"
EXAMPLE_REQS = EXAMPLES / "requirements.txt"
BUILD_NBHTML = BUILD / "nbsmoke"
EXAMPLE_DATASETS = EXAMPLES / "datasets"
LITE_LOGO = EXAMPLE_DATASETS / "logo.svg"
LAB_CSS_VARS = EXAMPLE_DATASETS / "jp_css_vars.txt"
LAB_THEMES = "share/jupyter/lab/themes"
LAB_EXTENSIONS = "share/jupyter/labextensions"
LAB_THEME_CSS = f"{LAB_THEMES}/@jupyterlab/theme-light-extension/index.css"
WIDGETS_STATIC = f"{LAB_EXTENSIONS}/@jupyter-widgets/jupyterlab-manager/static"

# mostly linting
ALL_PY_SRC = [*PY_SRC.rglob("*.py")]
ALL_PY = [
    *ALL_PY_SRC,
    *EXAMPLE_PY,
    *SCRIPTS.rglob("*.py"),
    DOCS_CONF,
    DODO,
]
ALL_YML = [*ROOT.glob("*.yml"), *GH.rglob("*.yml"), *DOCS.glob("*.yml")]
ALL_JSON = [
    *ROOT.glob("*.json"),
    *EXAMPLE_JSON,
    *LITE_JSON,
    *BINDER.glob("*.json"),
    *PAGES_LITE.glob("*.json"),
]
ALL_DOCS_MD = [*DOCS.rglob("*.md")]
ALL_MD = [*ROOT.glob("*.md"), *ALL_DOCS_MD, *GH.rglob("*.md")]
ALL_TS = [*TS_SRC.rglob("*.ts")]
ALL_CSS = [*STYLE.rglob("*.css")]
PRETTIER_IGNORE = ROOT / ".prettierignore"
ALL_PRETTIER = [*ALL_YML, *ALL_JSON, *ALL_MD, *ALL_TS, *ALL_CSS]
ALL_DOS2UNIX = [*ALL_YML, *EXAMPLE_IPYNB, *ALL_PRETTIER]

# built files
OK = BUILD / "ok"
OK_RELEASE = OK / "release.ok"
OK_PREFLIGHT_CONDA = OK / "preflight.conda.ok"
OK_PREFLIGHT_BUILD = OK / "preflight.build.ok"
OK_PREFLIGHT_KERNEL = OK / "preflight.kernel.ok"
OK_PREFLIGHT_LAB = OK / "preflight.lab.ok"
OK_PREFLIGHT_RELEASE = OK / "preflight.release.ok"
OK_BLACK = OK / "black.ok"
OK_PYPROJ_FMT = OK / "pyproject.ok"
OK_ROBOT_LINT = OK / "robot.lint.ok"
OK_LINT = OK / "lint.ok"
OK_RUFF = OK / "ruff.ok"
OK_MYPY = OK / "mypy.ok"
OK_NBLINT = {nb.name: OK / f"nblint.{nb.name}.ok" for nb in EXAMPLE_IPYNB}
OK_PIP_INSTALL = OK / "pip_install.ok"
OK_DOCS_PIP_INSTALL = OK / "docs_pip_install.ok"
OK_PRETTIER = OK / "prettier.ok"
OK_INDEX = OK / "index.ok"
OK_LABEXT = OK / "labext.ok"
OK_LINKS = OK / "links.ok"
OK_DICTIONARY = OK / "dictionary.ok"
OK_DOS2UNIX = OK / "dos2unix.ok"
OK_AUDIT_PY = OK / "audit.py.ok"
OK_AUDIT_JS = OK / "audit.js.ok"

REPORTS = BUILD / "reports"

UTEST_COV = REPORTS / "cov_utest"
UTEST_COV_DATA = UTEST_COV / ".coverage"
UTEST_COV_INDEX = UTEST_COV / "html/index.html"
ATEST_COV = REPORTS / "cov_atest"
ATEST_COV_JS = ATEST_COV / "js"
ATEST_COV_JS_INDEX = ATEST_COV_JS / "index.html"
ATEST_COV_PY = ATEST_COV / "py"
ATEST_COV_PY_INDEX = ATEST_COV_PY / "index.html"
ALL_COV_PY = REPORTS / "cov_ALL"
ALL_COV_PY_INDEX = ALL_COV_PY / "index.html"
PYTEST_COV_THRESHOLD = 90 if (WIN and PY_MAJOR == "3.8") else 91
PYTEST_HTML = REPORTS / "pytest.html"
PYTEST_XUNIT = REPORTS / "pytest.xunit.xml"
PYTEST_JSON = REPORTS / f"report-{PY_MAJOR}-{PLATFORM}.json"
JS_COV_LINE_THRESHOLD = 80
JS_COV_BRANCH_THRESHOLD = 59
ATEST_PY_COV_THRESHOLD = 88
ALL_PY_COV_THRESHOLD = 98

# derived info
PY_VERSION = PY_PROJ_DATA["project"]["version"]

# built artifacts
SDIST = DIST / f"{PY_PKG}-{PY_VERSION}.tar.gz"
WHEEL = DIST / f"{PY_PKG}-{PY_VERSION}-py3-none-any.whl"
NPM_TGZ_STEM = JS_PKG.replace("@", "").replace("/", "-")
NPM_TGZ = DIST / f"{NPM_TGZ_STEM}-{JS_VERSION}.tgz"
EXAMPLE_HTML = [BUILD_NBHTML / p.name.replace(".ipynb", ".html") for p in EXAMPLE_IPYNB]
HASH_DEPS = sorted([SDIST, NPM_TGZ, WHEEL])
SHA256SUMS = DIST / "SHA256SUMS"


# robot testing
ATEST = ROOT / "atest"
ATEST_FIXTURES = ATEST / "_resources/fixtures"
ALL_ROBOT = [*ATEST.rglob("*.robot"), *ATEST.rglob("*.resource")]
ATEST_OUT = REPORTS / "robot"
ATEST_CANARY = BUILD / f"robot.{PLATFORM.lower()}_success.ok"

# docs
DOCS_BUILDINFO = DOCS_BUILD / ".buildinfo"
DOCS_LINKS = BUILD / "links"

# nblint
NB_METADATA_KEYS = ["kernelspec", "language_info"]
CLOBBER_CELL_METADATA_KEYS = ["jupyter", "collapsed"]

# github pages
PAGES_LITE_CONFIG = PAGES_LITE / "jupyter_lite_config.json"

PAGES_LITE_BUILD = BUILD / "pages-lite"
PAGES_LITE_BUILD_SHASUMS = PAGES_LITE_BUILD / "SHA256SUMS"
