#!/bin/bash

$HADOOP_HOME/bin/yarn --daemon start --config $HADOOP_CONF_DIR resourcemanager

is_safemode=$(hdfs dfsadmin -safemode get)
retry=10
while [[ $is_safemode == *"ON"* && $retry != 0 ]]
do
    echo "HDFS is in Safe mode, wait 3s. retry = ${retry}"
    retry=$(($retry-1))
    sleep 3
    is_safemode=$(hdfs dfsadmin -safemode get)
done

sh /dcfs-job/myTestDCFS.sh
tail -F /dev/null