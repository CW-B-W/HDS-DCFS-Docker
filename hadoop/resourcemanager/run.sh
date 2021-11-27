#!/bin/bash

trap '$HADOOP_HOME/bin/yarn --config $HADOOP_CONF_DIR --daemon stop resourcemanager' EXIT INT TERM

$HADOOP_HOME/bin/yarn --config $HADOOP_CONF_DIR --daemon start resourcemanager

tail -F $HADOOP_HOME/logs/hadoop-$USER-resourcemanager-$(hostname).log