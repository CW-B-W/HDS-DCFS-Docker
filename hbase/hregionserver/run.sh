#!/bin/bash

zkServer.sh start
exec /opt/hbase-$HBASE_VERSION/bin/hbase regionserver start
