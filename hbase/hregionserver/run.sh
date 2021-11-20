#!/bin/bash

/entrypoint-zk.sh
zkServer.sh start
/opt/hbase-$HBASE_VERSION/bin/hbase regionserver start
