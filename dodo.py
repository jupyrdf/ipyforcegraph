"""doit tasks for ``ipyforcegraph``

    Generally, you'll just want to `doit`.

    `doit release` does pretty much everything.

    See `doit list` for more options.
"""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import os
import subprocess

from doit import create_after
from doit.action import CmdAction
from doit.tools import (
    LongRunning,
    PythonInteractiveAction,
    config_changed,
    create_folder,
)

from scripts import project as P
from scripts import reporter
from scripts import utils as U

os.environ.update(
    BLACK_CACHE_DIR=str(P.BUILD / ".black"),
    JUPYTER_PLATFORM_DIRS="1",
    MAMBA_NO_BANNER="1",
    NODE_OPTS="--max-old-space-size=4096",
    PIP_DISABLE_PIP_VERSION_CHECK="1",
    PIP_NO_BUILD_ISOLATION="1",
    PYDEVD_DISABLE_FILE_VALIDATION="1",
    PYTHONIOENCODING="utf-8",
    SOURCE_DATE_EPOCH=P.SOURCE_DATE_EPOCH,
)

DOIT_CONFIG = dict(
    reporter=reporter.GithubActionsReporter,
)


def _echo_ok(msg):
    def _echo():
        print(msg, flush=True)
        return True

    return _echo


def task_all():
    """do everything except start lab"""

    file_dep = [
        *P.EXAMPLE_HTML,
        P.ATEST_CANARY,
        P.UTEST_COV_INDEX,
        P.PYTEST_HTML,
        P.OK_LINKS,
        P.ALL_SPELL,
    ]

    if not P.TESTING_IN_CI:
        file_dep += [
            P.OK_RELEASE,
            P.SHA256SUMS,
        ]

    return dict(
        file_dep=file_dep,
        actions=([_echo_ok("ALL GOOD")]),
    )


def _ok(task, ok):
    task.setdefault("targets", []).append(ok)
    task["actions"] = [
        lambda: [ok.exists() and ok.unlink(), True][-1],
        *task["actions"],
        lambda: [
            ok.parent.mkdir(exist_ok=True, parents=True),
            ok.write_text("ok", **P.UTF8),
            True,
        ][-1],
    ]
    return task


def task_audit():
    """Check dependencies for known vulnerabilities."""
    yield _ok(
        dict(
            name="py",
            file_dep=[P.HISTORY, P.IGNORED_VULNERABILITIES],
            actions=[
                [*P.IN_ENV, "jake", "ddt", f"--whitelist={P.IGNORED_VULNERABILITIES}"]
            ],
        ),
        P.OK_AUDIT_PY,
    )

    yield _ok(
        dict(name="js", file_dep=[P.YARN_LOCK], actions=[[*P.IN_ENV, "jlpm", "audit"]]),
        P.OK_AUDIT_JS,
    )


def task_preflight():
    """ensure a sane development environment"""
    file_dep = [P.SCRIPTS / "preflight.py"]

    yield _ok(
        dict(
            uptodate=[config_changed({"commit": P.COMMIT})],
            name="conda",
            doc="ensure the conda envs have a chance of working",
            file_dep=file_dep,
            actions=(
                [_echo_ok("skipping preflight, hope you know what you're doing!")]
                if P.SKIP_CONDA_PREFLIGHT
                else [[*P.PREFLIGHT, "conda"]]
            ),
        ),
        P.OK_PREFLIGHT_CONDA,
    )

    yield _ok(
        dict(
            name="kernel",
            doc="ensure the kernel has a chance of working",
            file_dep=[*file_dep, P.HISTORY],
            actions=[[*P.IN_ENV, *P.PREFLIGHT, "kernel"]],
        ),
        P.OK_PREFLIGHT_KERNEL,
    )

    yield _ok(
        dict(
            name="lab",
            file_dep=[*file_dep, P.OK_LABEXT, P.HISTORY, P.LAB_CSS_VARS],
            actions=[[*P.IN_ENV, *P.PREFLIGHT, "lab"]],
        ),
        P.OK_PREFLIGHT_LAB,
    )

    yield _ok(
        dict(
            name="build",
            doc="ensure the build has a chance of succeeding",
            file_dep=[*file_dep, P.YARN_LOCK, P.HISTORY],
            actions=[[*P.IN_ENV, *P.PREFLIGHT, "build"]],
        ),
        P.OK_PREFLIGHT_BUILD,
    )

    yield _ok(
        dict(
            name="release",
            file_dep=[
                P.CHANGELOG,
                P.NPM_TGZ,
                P.PACKAGE_JSON,
                P.PY_PROJ,
                P.SDIST,
                P.WHEEL,
            ],
            actions=[[*P.IN_ENV, *P.PREFLIGHT, "release"]],
        ),
        P.OK_PREFLIGHT_RELEASE,
    )


def task_binder():
    """get to a minimal interactive environment"""
    return dict(
        file_dep=[P.OK_LABEXT],
        actions=[_echo_ok("ready to run JupyterLab with:\n\n\tdoit lab\n")],
    )


def task_env():
    """ensure environment reproducibility."""
    if P.CI or P.IN_RTD or P.IN_BINDER:
        return

    for spec_path in P.ENV_SPECS.glob("*.yml"):
        if spec_path.name.startswith("_"):
            continue
        spec = U.safe_load(spec_path)
        for platform in P.ALL_PLATFORMS:
            for stack in U.get_spec_stacks(spec_path, platform):
                yml_target = spec.get("_target")
                task = dict(file_dep=stack)
                if yml_target:
                    target = spec_path.parent / yml_target
                    yield dict(
                        doc=f"build environment.yml for {target.parent.name}",
                        actions=[
                            (
                                U.merge_envs,
                                [target, stack, spec.get("_remove_specs", [])],
                            )
                        ],
                        name=f"yml:{spec_path.stem}",
                        targets=[target.resolve()],
                        **task,
                    )
                else:
                    lockfile = "_".join(
                        [platform, stack[0].stem]
                        + [s.stem for s in stack if s.parent != P.ENV_SPECS]
                    )
                    target = P.LOCKS / f"{lockfile}.conda.lock"
                    yield dict(
                        doc=f"build lockfile for {lockfile.replace('_', ' ')}",
                        name=f"lock:{lockfile}",
                        actions=[(U.lock_one, [platform, target, stack])],
                        targets=[target],
                        **task,
                    )

    yield dict(
        name="lock",
        file_dep=[P.LOCK_LOCKFILE],
        targets=[P.LOCK_HISTORY],
        actions=[
            [*P.MAMBA_CREATE, P.LOCK_ENV, "--file", P.LOCK_LOCKFILE],
        ],
    )

    yield dict(
        name="dev",
        file_dep=[P.LOCKFILE],
        targets=[P.HISTORY],
        actions=[
            [*P.MAMBA_CREATE, P.ENV, "--file", P.LOCKFILE],
        ],
    )


def task_release():
    """everything we'd need to do to release (except release)"""
    return _ok(
        dict(
            file_dep=[
                P.OK_LINT,
                P.OK_PREFLIGHT_RELEASE,
                P.SHA256SUMS,
            ],
            actions=[_echo_ok("ready to release")],
        ),
        P.OK_RELEASE,
    )


def task_setup():
    """perform all setup activities"""

    _install = ["--no-deps", "--ignore-installed", "-vv"]

    if P.TESTING_IN_CI:
        if P.INSTALL_ARTIFACT == "wheel":
            _install += [P.WHEEL]
        elif P.INSTALL_ARTIFACT == "sdist":
            _install += [P.SDIST]
        else:
            raise RuntimeError(f"Don't know how to install {P.INSTALL_ARTIFACT}")
    else:
        _install += [
            "-e",
            ".",
            "--no-build-isolation",
            "--no-deps",
            "--no-cache-dir",
            "--ignore-installed",
        ]

    file_dep = [
        P.HISTORY,
    ]

    if not P.TESTING_IN_CI:
        file_dep += [
            P.PY_PROJ,
        ]

    py_actions = [
        [*P.IN_ENV, *P.PIP, "install", *_install],
        U.pip_check,
    ]

    if P.CI:
        print("setup:py actions")
        print(py_actions)

    py_task = _ok(
        dict(
            name="py",
            file_dep=file_dep,
            actions=py_actions,
        ),
        P.OK_PIP_INSTALL,
    )

    if P.TESTING_IN_CI and P.INSTALL_ARTIFACT:
        py_task = _ok(py_task, P.OK_LABEXT)
    else:
        py_task["file_dep"] += [P.PY_PACKAGE_JSON]

    yield py_task

    if P.CI and P.YARN_INTEGRITY.exists():
        return

    if not P.TESTING_IN_CI:
        install_deps = [P.PACKAGE_JSON, P.HISTORY]
        install_targets = [P.YARN_INTEGRITY]
        install_args = [*P.JLPM_INSTALL]

        if P.YARN_LOCK.exists():
            install_deps += [P.YARN_LOCK]
        else:
            install_targets += [P.YARN_LOCK]

        if P.CI:
            install_args += ["--frozen-lockfile"]

        install_actions = [[*P.IN_ENV, *install_args]]

        if not P.CI:
            install_actions += [[*P.IN_ENV, "jlpm", "deduplicate"]]

        yield dict(
            name="js",
            file_dep=install_deps,
            actions=install_actions,
            targets=install_targets,
        )
        yield _ok(
            dict(
                name="labext",
                actions=[[*P.IN_ENV, *P.LAB_EXT, "develop", "--overwrite", "."]],
                file_dep=[P.OK_PIP_INSTALL, P.PY_PACKAGE_JSON, P.HISTORY],
            ),
            P.OK_LABEXT,
        )


def task_build():
    """build packages"""
    if P.TESTING_IN_CI:
        return

    ts_dep = [
        *P.ALL_TS,
        *P.ALL_TSCONFIG,
        P.HISTORY,
        P.PACKAGE_JSON,
        P.YARN_INTEGRITY,
    ]

    py_dep = [
        *P.ALL_PY_SRC,
        P.HISTORY,
        P.LICENSE,
        P.PY_PACKAGE_JSON,
        P.PY_PROJ,
    ]

    if P.USE_LOCK_ENV:
        ts_dep += [P.OK_PRETTIER]
        py_dep += [P.OK_LINT]

    if P.TOTAL_COVERAGE:
        ts_script = "build:ts:cov"
    else:
        ts_script = "build:ts"

    yield dict(
        name="ts",
        uptodate=[config_changed({"TOTAL_COVERAGE": P.TOTAL_COVERAGE})],
        file_dep=ts_dep,
        actions=[[*P.IN_ENV, *P.JLPM, ts_script]],
        targets=[P.TSBUILDINFO, P.JS_LIB_INDEX_JS],
    )

    yield dict(
        name="ext",
        uptodate=[config_changed({"TOTAL_COVERAGE": P.TOTAL_COVERAGE})],
        actions=[[*P.IN_ENV, *P.JLPM, "build:ext"]],
        file_dep=[P.TSBUILDINFO, P.JS_LIB_INDEX_JS, *P.ALL_CSS],
        targets=[P.PY_PACKAGE_JSON],
    )

    yield dict(
        name="pack",
        file_dep=[P.TSBUILDINFO, P.PACKAGE_JSON, *P.ALL_CSS, P.README, P.LICENSE],
        actions=[
            (create_folder, [P.DIST]),
            CmdAction([*P.IN_ENV, "npm", "pack", ".."], shell=False, cwd=str(P.DIST)),
        ],
        targets=[P.NPM_TGZ],
    )

    yield dict(
        name="py",
        uptodate=[config_changed(dict(SOURCE_DATE_EPOCH=P.SOURCE_DATE_EPOCH))],
        file_dep=py_dep,
        actions=[[*P.IN_ENV, "flit", "--debug", "build"]],
        targets=[P.WHEEL, P.SDIST],
    )

    yield dict(
        name="hash",
        file_dep=P.HASH_DEPS,
        targets=[P.SHA256SUMS],
        actions=[(U.hash_files, [P.SHA256SUMS, P.HASH_DEPS])],
    )


def task_pytest():
    """run python unit tests"""
    utest_args = [
        *P.IN_ENV,
        "pytest",
        f"--cov-fail-under={P.PYTEST_COV_THRESHOLD}",
        f"--json-report-file={P.PYTEST_JSON}",
    ]

    if P.UTEST_PROCESSES:
        utest_args += ["-n", P.UTEST_PROCESSES]

    if P.PYTEST_ARGS:
        utest_args += P.PYTEST_ARGS

    yield dict(
        name="utest",
        doc="run unit tests with pytest",
        uptodate=[config_changed(dict(COMMIT=P.COMMIT, args=P.PYTEST_ARGS))],
        file_dep=[*P.ALL_PY_SRC, P.PY_PROJ, P.OK_PIP_INSTALL],
        targets=[
            P.UTEST_COV_INDEX,
            P.PYTEST_HTML,
            P.PYTEST_XUNIT,
            P.PYTEST_JSON,
            P.UTEST_COV_DATA,
        ],
        actions=[
            (U.clean_some, [P.UTEST_COV]),
            (create_folder, [P.UTEST_COV]),
            utest_args,
            lambda: U.strip_timestamps(
                *P.UTEST_COV_INDEX.rglob("*.html"), P.PYTEST_HTML, slug=P.COMMIT
            ),
        ],
    )


def task_test():
    """run all the notebooks"""
    if P.IN_BINDER:
        return

    def _nb_test(nb):
        def _test():
            env = dict(os.environ)
            env.update(IPYFORCEGRAPH_TESTING="true")
            args = [
                *P.IN_ENV,
                "jupyter",
                "nbconvert",
                "--to",
                "html",
                "--output-dir",
                P.BUILD_NBHTML,
                "--execute",
                "--ExecutePreprocessor.timeout=1200",
                nb,
            ]
            return CmdAction(args, env=env, shell=False)

        html = P.BUILD_NBHTML / nb.name.replace(".ipynb", ".html")

        file_dep = [
            *P.ALL_PY_SRC,
            *P.EXAMPLE_IPYNB,
            *P.EXAMPLE_JSON,
            P.HISTORY,
            P.OK_PIP_INSTALL,
            P.OK_PREFLIGHT_KERNEL,
            *([] if P.TESTING_IN_CI else [P.OK_NBLINT[nb.name]]),
        ]

        return dict(
            name=f"nb:{nb.name}".replace(" ", "_").replace(".ipynb", ""),
            file_dep=file_dep,
            actions=[
                (U.clean_some, [html]),
                _test(),
                (
                    U.html_expect_xpath_matches,
                    [html, U.XP_JUPYTER_STDERR, 0, "stderr output"],
                ),
            ],
            targets=[html],
        )

    for nb in P.EXAMPLE_IPYNB:
        yield _nb_test(nb)

    for robot_template in P.ATEST.rglob("*.j2"):
        if "ipynb_checkpoints" in str(robot_template):
            continue
        for graph_class in P.PY_GRAPH_CLASSES:
            name = robot_template.name.replace(".j2", "").replace("GRAPH", graph_class)
            robot_out = robot_template.parent / name
            yield dict(
                name=f"atest:template:{robot_out.relative_to(P.ATEST)}",
                actions=[
                    (
                        U.template_one,
                        [robot_template, robot_out, {"graph_class": graph_class}],
                    )
                ],
                file_dep=[robot_template],
                targets=[robot_out],
            )

    yield dict(
        name="atest",
        uptodate=[config_changed({"TOTAL_COVERAGE": P.TOTAL_COVERAGE})],
        file_dep=[
            *P.ALL_PY_SRC,
            *P.ALL_ROBOT,
            *P.EXAMPLE_IPYNB,
            *P.EXAMPLE_JSON,
            P.OK_PIP_INSTALL,
            P.OK_PREFLIGHT_LAB,
            P.SCRIPTS / "atest.py",
            *([] if P.TESTING_IN_CI else [P.OK_ROBOT_LINT, *P.OK_NBLINT.values()]),
        ],
        task_dep=["pytest"],
        actions=[[*P.IN_ENV, *P.PYM, "scripts.atest"]],
        targets=[P.ATEST_CANARY],
    )


def task_coverage():
    """collect and assess all coverage"""
    if not P.TOTAL_COVERAGE:
        return

    yield dict(
        name="atest:js",
        file_dep=[P.ATEST_CANARY],
        actions=[U.atest_cov_js],
        targets=[P.ATEST_COV_JS_INDEX],
    )

    yield dict(
        name="atest:py",
        file_dep=[P.ATEST_CANARY],
        actions=[U.atest_cov_py],
        targets=[P.ATEST_COV_PY_INDEX],
    )

    yield dict(
        name="all",
        file_dep=[P.ATEST_COV_PY_INDEX, P.UTEST_COV_DATA],
        actions=[U.all_cov],
        targets=[P.ALL_COV_PY_INDEX],
    )


def task_lint():
    """format all source files"""
    if P.TESTING_IN_CI or P.IN_BINDER:
        return

    yield _ok(
        dict(
            name="pyproject",
            file_dep=[P.PY_PROJ, P.HISTORY],
            actions=[[*P.IN_ENV, "pyproject-fmt", P.PY_PROJ]],
        ),
        P.OK_PYPROJ_FMT,
    )

    yield _ok(
        dict(
            name="black",
            file_dep=[*P.ALL_PY, P.HISTORY],
            actions=[
                [*P.IN_ENV, "ssort", *P.ALL_PY],
                [*P.IN_ENV, "black", "--quiet", *P.ALL_PY],
            ],
        ),
        P.OK_BLACK,
    )

    yield _ok(
        dict(
            name="ruff",
            file_dep=[*P.ALL_PY, P.OK_BLACK, P.PY_PROJ],
            actions=[[*P.IN_ENV, "ruff", "--fix", *P.ALL_PY]],
        ),
        P.OK_RUFF,
    )

    yield _ok(
        dict(
            name="mypy",
            file_dep=[*P.ALL_PY, P.OK_BLACK],
            actions=[[*P.IN_ENV, "mypy", *P.ALL_PY_SRC]],
        ),
        P.OK_MYPY,
    )

    yield _ok(
        dict(
            name="prettier",
            uptodate=[
                config_changed(
                    dict(
                        conf=P.JS_PACKAGE_DATA["prettier"],
                        script=P.JS_PACKAGE_DATA["scripts"]["lint:prettier"],
                    )
                )
            ],
            file_dep=[
                *P.ALL_PRETTIER,
                P.HISTORY,
                P.PRETTIER_IGNORE,
                P.YARN_INTEGRITY,
            ],
            actions=[
                [*P.IN_ENV, "npm", "run", "lint:prettier"],
            ],
        ),
        P.OK_PRETTIER,
    )

    for nb in P.EXAMPLE_IPYNB:
        yield _ok(
            dict(
                name=f"nblint:{nb.name}".replace(" ", "_").replace(".ipynb", ""),
                file_dep=[P.YARN_INTEGRITY, nb, P.HISTORY, P.OK_BLACK, P.PY_PROJ],
                actions=[
                    [*P.IN_ENV, "nbstripout", nb],
                    (U.notebook_lint, [nb]),
                    [*P.IN_ENV, "nbqa", "ruff", "--fix", nb],
                    [
                        *P.IN_ENV,
                        "jupyter-nbconvert",
                        "--log-level=WARN",
                        "--to=notebook",
                        "--inplace",
                        "--output",
                        nb,
                        nb,
                    ],
                    (U.fix_line_endings, [nb]),
                ],
            ),
            P.OK_NBLINT[nb.name],
        )

    yield _ok(
        dict(
            name="dos2unix",
            file_dep=[*P.ALL_DOS2UNIX, *[*P.OK_NBLINT.values()]],
            actions=[U.fix_windows_line_endings],
        ),
        P.OK_DOS2UNIX,
    )

    yield _ok(
        dict(
            name="robot",
            file_dep=[
                *P.ALL_ROBOT,
                *P.ALL_PY_SRC,
                *P.ALL_TS,
                P.SCRIPTS / "atest.py",
                P.OK_RUFF,
                P.HISTORY,
            ],
            actions=[
                [*P.IN_ENV, *P.PYM, "robotidy", *P.ALL_ROBOT],
                [*P.IN_ENV, *P.PYM, "scripts.atest", "--dryrun"],
            ],
        ),
        P.OK_ROBOT_LINT,
    )

    index_src = P.EXAMPLE_INDEX.read_text(**P.UTF8)

    def _make_index_check(ex):
        def _check():
            md = f"(./{ex.name})"

            if md not in index_src:
                print(f"{ex.name} link missing in _index.ipynb")
                return False

        return _check

    yield _ok(
        dict(
            name="index",
            file_dep=P.EXAMPLE_IPYNB,
            actions=[
                _make_index_check(ex) for ex in P.EXAMPLE_IPYNB if ex != P.EXAMPLE_INDEX
            ],
        ),
        P.OK_INDEX,
    )

    yield _ok(
        dict(
            name="all",
            actions=[_echo_ok("all ok")],
            file_dep=[
                P.OK_BLACK,
                P.OK_INDEX,
                P.OK_PRETTIER,
                P.OK_RUFF,
                P.OK_PYPROJ_FMT,
                P.OK_ROBOT_LINT,
            ],
        ),
        P.OK_LINT,
    )


def task_lab():
    """run JupyterLab "normally" (not watching sources)"""

    def lab():
        proc = subprocess.Popen(
            list(map(str, P.JUPYTERLAB_EXE)),
            stdin=subprocess.PIPE,
        )
        try:
            proc.wait()
        except KeyboardInterrupt:
            print("attempting to stop lab, you may want to check your process monitor")
            proc.terminate()
            proc.communicate(b"y\n")

        proc.wait()
        return True

    return dict(
        uptodate=[lambda: False],
        file_dep=[P.OK_PIP_INSTALL, P.OK_PREFLIGHT_LAB],
        actions=[PythonInteractiveAction(lab)],
    )


def task_watch():
    """watch typescript sources, launch lab, rebuilding as files change"""
    if P.TESTING_IN_CI:
        return

    return dict(
        uptodate=[lambda: False],
        file_dep=[P.OK_PREFLIGHT_LAB],
        actions=[[*P.IN_ENV, "jlpm", "watch"]],
    )


def task_lite():
    """build the jupyterlite site"""

    lab_css_src = P.ENV / P.LAB_THEME_CSS
    widget_static = sorted((P.ENV / P.WIDGETS_STATIC).glob("*.js"))

    if lab_css_src and widget_static:
        yield dict(
            name=f"data:{P.LAB_CSS_VARS.name}",
            file_dep=[P.HISTORY, lab_css_src, *widget_static],
            actions=[
                (
                    U.gather_css_variables,
                    [P.LAB_CSS_VARS, [lab_css_src, *widget_static]],
                )
            ],
            targets=[P.LAB_CSS_VARS],
        )

    yield dict(
        name="logo",
        file_dep=[P.LOGO_SVG, P.HISTORY],
        targets=[P.LITE_LOGO],
        actions=[
            (U.clean_some, [P.LITE_LOGO]),
            (
                U.minimize_one_svg,
                [P.LOGO_SVG, P.LITE_LOGO],
                dict(strip_decl=True, strip_svg_attrs=["width", "height"]),
            ),
        ],
    )

    yield dict(
        name="build",
        file_dep=[
            *P.EXAMPLE_IPYNB,
            *P.EXAMPLE_JSON,
            *P.LITE_JSON,
            P.EXAMPLE_REQS,
            P.OK_PIP_INSTALL,
            P.WHEEL,
            P.LITE_LOGO,
        ],
        targets=[P.LITE_SHA256SUMS],
        actions=[
            CmdAction(
                [*P.IN_ENV, "jupyter", "lite", "build"], shell=False, cwd=str(P.LITE)
            ),
            CmdAction(
                [
                    *P.IN_ENV,
                    "jupyter",
                    "lite",
                    "doit",
                    "--",
                    "pre_archive:report:SHA256SUMS",
                ],
                shell=False,
                cwd=str(P.LITE),
            ),
        ],
    )


def task_docs():
    """build the docs (mostly as readthedocs would)"""
    yield dict(
        name="sphinx",
        file_dep=[
            P.DOCS_CONF,
            *P.ALL_PY_SRC,
            *P.ALL_MD,
            P.OK_PIP_INSTALL,
            P.LITE_SHA256SUMS,
            P.SHA256SUMS,
        ],
        targets=[P.DOCS_BUILDINFO],
        actions=[
            [
                *P.IN_ENV,
                "sphinx-build",
                *P.SPHINX_ARGS,
                "-b",
                "html",
                P.DOCS,
                P.DOCS_BUILD,
            ]
        ],
    )


def task_watch_docs():
    """continuously rebuild the docs on change"""
    yield dict(
        uptodate=[lambda: False],
        name="sphinx-autobuild",
        file_dep=[P.DOCS_BUILDINFO, *P.ALL_MD, P.OK_PIP_INSTALL],
        actions=[
            LongRunning(
                [
                    *P.IN_ENV,
                    "sphinx-autobuild",
                    f"--watch={P.PY_SRC}",
                    P.DOCS,
                    P.DOCS_BUILD,
                ],
                shell=False,
            )
        ],
    )


def _make_spellcheck(dep, html):
    ok = P.BUILD / "spell" / f"{dep.relative_to(html)}.ok"
    fail_path = P.BUILD / "spell" / f"{dep.relative_to(html)}.fail"

    def spell():
        if fail_path.exists():
            fail_path.unlink()
        fails = sorted(
            set(
                subprocess.check_output(
                    [
                        *P.IN_ENV,
                        "hunspell",
                        "-l",
                        "-d",
                        "en_US,en-GB",
                        "-p",
                        P.DICTIONARY,
                        "-H",
                        dep,
                    ]
                )
                .decode("utf-8")
                .strip()
                .splitlines()
            )
        )

        if fails:
            fail_str = "\n".join(fails)
            print("Unrecognized words in", dep)
            print(fail_str)
            fail_path.parent.mkdir(exist_ok=True, parents=True)
            fail_path.write_text(fail_str, **P.UTF8)

    return _ok(
        dict(
            name=f"""spell:{dep.relative_to(html)}""".replace("/", "_"),
            doc=f"check spelling in {dep.relative_to(html)}",
            file_dep=[dep, P.DICTIONARY],
            actions=[spell],
        ),
        ok,
    )


def _all_spell():
    all_fail = []
    for path in sorted(P.ALL_SPELL.parent.rglob("*.fail")):
        if path == P.ALL_SPELL:
            continue
        all_fail += path.read_text(**P.UTF8).strip().splitlines()

    all_fail_str = "\n".join(sorted(set(all_fail)))

    if all_fail_str:
        print("ALL Unrecognized words")
        print(all_fail_str)

    P.ALL_SPELL.write_text(all_fail_str, **P.UTF8)

    return len(all_fail) == 0


@create_after(executed="docs", target_regex=r"build/docs/html/.*\.html")
def task_checkdocs():
    """check spelling and links of build docs HTML."""
    no_check = ["htmlcov", "pytest", "_static", "genindex"]
    html = P.DOCS_BUILD
    file_dep = sorted(
        {
            p
            for p in html.rglob("*.html")
            if all(n not in str(p.relative_to(P.DOCS_BUILD)) for n in no_check)
        }
    )

    yield _ok(
        dict(
            name="links",
            doc="check for well-formed links",
            file_dep=file_dep,
            actions=[
                (create_folder, [P.DOCS_LINKS]),
                CmdAction(
                    [
                        *P.IN_ENV,
                        "pytest-check-links",
                        "-vv",
                        "--no-cov",
                        *["-p", "no:importnb"],
                        "--check-links-cache",
                        *["--check-links-cache-name", P.DOCS_LINKS],
                        # TODO: relax these once published
                        "--check-links-ignore",
                        "https://",
                        "--links-ext=html",
                        *file_dep,
                    ],
                    shell=False,
                    cwd=P.DOCS_BUILD,
                ),
            ],
        ),
        P.OK_LINKS,
    )

    spell_tasks = []

    yield _ok(
        dict(
            name="dictionary",
            doc="ensure dictionary is unique and sorted",
            file_dep=[P.DICTIONARY],
            actions=[(U.sort_unique, [P.DICTIONARY])],
        ),
        P.OK_DICTIONARY,
    )

    for dep in file_dep:
        task = _make_spellcheck(dep, html)
        task["file_dep"] += [P.OK_DICTIONARY]
        spell_tasks += [f"""checkdocs:{task["name"]}"""]
        yield task
        rel_path = dep.relative_to(P.DOCS_BUILD)
        yield dict(
            name=f"xref:{rel_path}",
            file_dep=[dep],
            actions=[
                (U.html_expect_xpath_matches, [dep, U.XP_BAD_XREF, 0, "bad xref"]),
            ],
        )

    yield dict(
        name="spell:ALL",
        task_dep=spell_tasks,
        actions=[_all_spell],
        targets=[P.ALL_SPELL],
    )


def task_site():
    yield dict(
        name="build",
        file_dep=[
            P.PAGES_LITE_CONFIG,
            P.UTEST_COV_INDEX,
            P.ATEST_COV_JS_INDEX,
            P.ALL_COV_PY_INDEX,
        ],
        targets=[P.PAGES_LITE_BUILD_SHASUMS],
        actions=[
            CmdAction(
                [*P.IN_ENV, "jupyter", "lite", "build"],
                shell=False,
                cwd=str(P.PAGES_LITE),
            ),
            lambda: U.hash_files(
                P.PAGES_LITE_BUILD_SHASUMS,
                [p for p in P.PAGES_LITE_BUILD.rglob("*") if not p.is_dir()],
                quiet=True,
            ),
        ],
    )
