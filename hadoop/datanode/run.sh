#!/bin/bash

datadir=`echo $HDFS_CONF_dfs_datanode_data_dir | perl -pe 's#file://##'`
if [ ! -d $datadir ]; then
  echo "Datanode data directory not found: $datadir"
  exit 2
fi

trap '$HADOOP_HOME/bin/hdfs --config $HADOOP_CONF_DIR --daemon stop datanode' EXIT INT TERM

$HADOOP_HOME/bin/hdfs --config $HADOOP_CONF_DIR --daemon start datanode

tail -F $HADOOP_HOME/logs/hadoop-$USER-datanode-$(hostname).log &
child=$! 
wait "$child"