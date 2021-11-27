#!/bin/bash

trap '$HADOOP_HOME/bin/yarn --config $HADOOP_CONF_DIR --daemon stop historyserver' EXIT INT TERM

$HADOOP_HOME/bin/yarn --config $HADOOP_CONF_DIR --daemon start historyserver

tail -F $HADOOP_HOME/logs/hadoop-$USER-historyserver-$(hostname).log