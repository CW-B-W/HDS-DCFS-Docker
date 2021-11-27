#!/bin/bash

trap 'zkServer.sh stop' EXIT INT TERM

zkServer.sh start

tail -F /zookeeper/logs/zookeeper--server-$(hostname).out &
child=$! 
wait "$child"