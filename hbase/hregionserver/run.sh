#!/bin/bash

trap '/opt/hbase-$HBASE_VERSION/bin/hbase-daemon.sh stop regionserver' EXIT INT TERM

service cron start
crontab /crontab_cleantmp.sh # crontab for clean tmp files

# exec /opt/hbase-$HBASE_VERSION/bin/hbase regionserver start
/opt/hbase-$HBASE_VERSION/bin/hbase-daemon.sh start regionserver
# /opt/hbase-$HBASE_VERSION/bin/hbase-daemon.sh start thrift

# queryserver.py start &
sh /check_regionserver.sh > /check_regionserver.log &

tail -F /opt/hbase-2.3.5/logs/hbase-$USER-regionserver-$(hostname).out &
child=$! 
wait "$child"
