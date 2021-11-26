#!/bin/bash

$HADOOP_HOME/bin/yarn --daemon start --config $HADOOP_CONF_DIR nodemanager

tail -F /dev/null