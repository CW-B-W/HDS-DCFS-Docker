#!/bin/bash

trap '/opt/hbase-$HBASE_VERSION/bin/hbase-daemon.sh stop regionserver' EXIT INT TERM

# exec /opt/hbase-$HBASE_VERSION/bin/hbase regionserver start
/opt/hbase-$HBASE_VERSION/bin/hbase-daemon.sh start regionserver

tail -F /opt/hbase-2.3.5/logs/hbase-$USER-regionserver-$(hostname).out