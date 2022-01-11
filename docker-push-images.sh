docker tag dslab/hadoop-base cwbw/hadoop-base
docker tag dslab/hadoop-namenode cwbw/hadoop-namenode
docker tag dslab/hadoop-datanode cwbw/hadoop-datanode
docker tag dslab/hadoop-resourcemanager cwbw/hadoop-resourcemanager
docker tag dslab/hadoop-nodemanager cwbw/hadoop-nodemanager
docker tag dslab/hadoop-historyserver cwbw/hadoop-historyserver
docker tag dslab/hadoop-submit cwbw/hadoop-submit
docker tag dslab/zookeeper cwbw/zookeeper
docker tag dslab/hbase-base cwbw/hbase-base
docker tag dslab/hbase-hmaster cwbw/hbase-hmaster
docker tag dslab/hbase-hregionserver cwbw/hbase-hregionserver
docker tag dslab/dcfs-master cwbw/dcfs-master
docker tag dslab/dcfs-worker cwbw/dcfs-worker
docker tag dslab/flask cwbw/flask
docker push cwbw/hadoop-base
docker push cwbw/hadoop-namenode
docker push cwbw/hadoop-datanode
docker push cwbw/hadoop-resourcemanager
docker push cwbw/hadoop-nodemanager
docker push cwbw/hadoop-historyserver
docker push cwbw/hadoop-submit
docker push cwbw/zookeeper
docker push cwbw/hbase-base
docker push cwbw/hbase-hmaster
docker push cwbw/hbase-hregionserver
docker push cwbw/dcfs-master
docker push cwbw/dcfs-worker
docker push cwbw/flask