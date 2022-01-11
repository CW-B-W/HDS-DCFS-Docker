#!/bin/bash

trap '$HADOOP_HOME/bin/yarn --config $HADOOP_CONF_DIR --daemon stop nodemanager' EXIT INT TERM

service cron start
crontab /crontab_cleantmp.sh # crontab for clean tmp files

$HADOOP_HOME/bin/yarn --config $HADOOP_CONF_DIR --daemon start nodemanager

tail -F $HADOOP_HOME/logs/hadoop-$USER-nodemanager-$(hostname).log &
child=$! 
wait "$child"