#!/bin/bash

$HADOOP_HOME/bin/yarn --daemon start --config $HADOOP_CONF_DIR resourcemanager

nohup python3 /dcfs-share/dcfs-run/task_consumer.py &

is_safemode=$(hdfs dfsadmin -safemode get)
retry=10
while [[ $is_safemode == *"ON"* && $retry != 0 ]]
do
    echo "HDFS is in Safe mode, wait 3s. retry = ${retry}"
    retry=$(($retry-1))
    sleep 3
    is_safemode=$(hdfs dfsadmin -safemode get)
done

sh /dcfs-job/demoDCFS.sh

tail -F /dev/null