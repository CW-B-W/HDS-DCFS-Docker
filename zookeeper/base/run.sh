#!/bin/bash

trap 'zkServer.sh stop' EXIT INT TERM

zkServer.sh start

tail -F /dev/null