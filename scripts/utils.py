# from https://github.com/jupyrdf/ipyradiant/blob/master/_scripts/utils.py

# Copyright (c) 2020 ipyradiant contributors.
# Distributed under the terms of the Modified BSD License.
# Copyright (c) 2023 ipyforcegraph contributors.
# Distributed under the terms of the Modified BSD License.

import re
from pathlib import Path

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
