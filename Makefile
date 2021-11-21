.PHONY: build
build: build-hadoop build-zk build-hbase

.PHONY: build-hadoop
build-hadoop:
	docker build -t dslab/hadoop-base ./hadoop/base
	docker build -t dslab/hadoop-namenode ./hadoop/namenode
	docker build -t dslab/hadoop-datanode ./hadoop/datanode
	docker build -t dslab/hadoop-resourcemanager ./hadoop/resourcemanager
	docker build -t dslab/hadoop-nodemanager ./hadoop/nodemanager
	docker build -t dslab/hadoop-historyserver ./hadoop/historyserver
	docker build -t dslab/hadoop-submit ./hadoop/submit

.PHONY: build-zk
build-zk:
	docker build -t dslab/zookeeper ./zookeeper/base

.PHONY: build-hbase
build-hbase:
	docker build -t dslab/hbase-base ./hbase/base
	docker build -t dslab/hbase-hmaster ./hbase/hmaster
	docker build -t dslab/hbase-hregionserver ./hbase/hregionserver

.PHONY: up
up:
	docker-compose up -d

.PHONY: down
down:
	docker-compose down

.PHONY: logs
logs:
	docker-compose logs | grep $(name)
