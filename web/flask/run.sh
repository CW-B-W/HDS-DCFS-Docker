#!/bin/bash
# export FLASK_APP=hello
# export FLASK_ENV=production
# export PYTHONPATH=/
# export LC_ALL=C.UTF-8
# export LANG=C.UTF-8

trap 'kill -s INT $child' EXIT INT TERM

flask run --host 0.0.0.0 &
child=$!
wait "$child"