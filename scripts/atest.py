"""Run acceptance tests with robot framework"""

# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

# pylint: disable=broad-except
import json
import os
import shutil
import sys
import time

import robot
from pabot import pabot

from . import project as P

PROCESSES = int(os.environ.get("ATEST_PROCESSES", "4"))
RETRIES = int(os.environ.get("ATEST_RETRIES", "0"))
ATTEMPT = int(os.environ.get("ATEST_ATTEMPT", "0"))

# used in some example notebooks
os.environ.update(IPFG_ROOT=str(P.ROOT))


def get_stem(attempt, extra_args):
    """make a directory stem with the run type, python and os version"""
    stem = "_".join([P.PLATFORM, str(attempt)]).replace(".", "_").lower()

    if "--dryrun" in extra_args:
        stem = f"dry_run_{stem}"

    return stem


def atest(attempt, extra_args):
    """perform a single attempt of the acceptance tests"""
    stem = get_stem(attempt, extra_args)

    if attempt != 1:
        previous = P.ATEST_OUT / f"{get_stem(attempt - 1, extra_args)}" / "output.xml"
        print(f"Attempt {attempt} will try to re-run tests from {previous}")

        extra_args += ["--loglevel", "TRACE"]

        if previous.exists():
            extra_args += ["--rerunfailed", previous]
        else:
            print(f"... can't re-run failed, missing: {previous}")

    out_dir = P.ATEST_OUT / stem

    jupyterlab_cmd = P.JUPYTERLAB_EXE

    args = [
        *["--name", f"{P.PLATFORM}"],
        *["--outputdir", out_dir],
        *["--log", out_dir / "log.html"],
        *["--report", out_dir / "report.html"],
        *["--xunit", out_dir / "xunit.xml"],
        *["--settag", f"ipfg:{P.PY_VERSION}"],
        *["--settag", f"py:{P.PY_MAJOR}"],
        *["--settag", f"os:{P.PLATFORM.lower()}"],
        *["--variable", f"OS:{P.PLATFORM}"],
        *["--variable", f"PY:{P.PY_MAJOR}"],
        *["--variable", f"IPYFORCEGRAPH_EXAMPLES:{P.EXAMPLES}"],
        *["--variable", f"IPYFORCEGRAPH_FIXTURES:{P.ATEST_FIXTURES}"],
        *["--variable", f"JUPYTERLAB_EXE:{json.dumps(list(map(str,jupyterlab_cmd)))}"],
        *["--variable", f"ATEST_COV:{P.ATEST_COV}"],
        *["--variable", f"TOTAL_COVERAGE:{int(P.TOTAL_COVERAGE)}"],
        *["--randomize", "all"],
        *(extra_args or []),
        *(json.loads(os.environ.get("ATEST_ARGS", "[]"))),
    ]

    if out_dir.exists():
        print("trying to clean out {}".format(out_dir))
        try:
            shutil.rmtree(out_dir)
        except Exception as err:
            print("Error deleting {}, hopefully harmless: {}".format(out_dir, err))

    out_dir.mkdir(parents=True)

    os.chdir(out_dir)

    if "--dryrun" in extra_args or PROCESSES == 1:
        run_robot = robot.run_cli
        fake_cmd = "robot"
        args += ["--variable", "IN_PABOT:0"]
    else:
        run_robot = pabot.main
        fake_cmd = "pabot"

        # pabot args must come first
        args = [
            *["--processes", PROCESSES],
            "--artifactsinsubfolders",
            *["--artifacts", "png,log,svg,json"],
            *["--variable", "IN_PABOT:1"],
            *args,
        ]

    args += [P.ATEST]

    print(f"[{fake_cmd} test root]\n", P.ATEST)
    print(f"[{fake_cmd} arguments]\n", " ".join(list(map(str, args))))

    try:
        run_robot(list(map(str, args)))
        return 0
    except SystemExit as err:
        print(run_robot.__name__, "exited with", err.code)
        return err.code


def attempt_atest_with_retries(*extra_args):
    """retry the robot tests a number of times"""
    attempt = ATTEMPT
    error_count = -1

    is_real = "--dryrun" not in extra_args

    if is_real and P.ATEST_CANARY.exists():
        P.ATEST_CANARY.unlink()

    while error_count != 0 and attempt <= RETRIES:
        attempt += 1
        print("attempt {} of {}...".format(attempt, RETRIES + 1))
        start_time = time.time()
        error_count = atest(attempt=attempt, extra_args=list(extra_args))
        print(error_count, "errors in", int(time.time() - start_time), "seconds")

    if is_real and not error_count:
        P.ATEST_CANARY.touch()

    return error_count


if __name__ == "__main__":
    sys.exit(attempt_atest_with_retries(*sys.argv[1:]))
