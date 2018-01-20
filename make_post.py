import datetime
import unicodedata
import re
import os
import sys

POSTS_PATH = os.path.join("site", "_posts")

HEADING = """---
layout: post
title: "%s"
date: %s
---
"""
FILENAME = "%s-%s.md"

_slugify_strip_re = re.compile(r'[^\w\s-]')
_slugify_hyphenate_re = re.compile(r'[-\s]+')

def slugify(value):
    value = _slugify_strip_re.sub('', value).strip().lower()
    return _slugify_hyphenate_re.sub('-', value)


if __name__ == "__main__":
    title = sys.argv[1]
    date = datetime.date.today()

    flat_title = slugify(title)
    filename = FILENAME % (date, flat_title)
    file_path = os.path.join(POSTS_PATH, filename)

    if not os.path.isfile(file_path):
        with open(file_path, "w") as f:
            f.write(HEADING % (title, date))
    print("%s" % file_path)
