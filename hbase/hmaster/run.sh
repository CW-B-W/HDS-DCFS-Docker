#!/bin/bash

trap '/opt/hbase-$HBASE_VERSION/bin/hbase-daemon.sh stop master' EXIT INT TERM

# exec /opt/hbase-$HBASE_VERSION/bin/hbase master start
/opt/hbase-$HBASE_VERSION/bin/hbase-daemon.sh start master

tail -F /opt/hbase-2.3.5/logs/hbase-$USER-master-$(hostname).log