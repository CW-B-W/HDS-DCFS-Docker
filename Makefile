.PHONY: build
build: build-hadoop build-zk build-hbase build-dcfs build-flask

.PHONY: build-bg
build-bg:
	nohup make build > $(shell pwd)/docker-build.log 2>&1 &
	chmod a+r $(shell pwd)/docker-build.log

.PHONY: build-bg-log
build-bg-log:
	tail -f docker-build.log

.PHONY: build-hadoop
build-hadoop:
	docker build -t cwbw/hadoop-base ./hadoop/base
	docker build -t cwbw/hadoop-namenode ./hadoop/namenode
	docker build -t cwbw/hadoop-datanode ./hadoop/datanode
	docker build -t cwbw/hadoop-resourcemanager ./hadoop/resourcemanager
	docker build -t cwbw/hadoop-nodemanager ./hadoop/nodemanager
	docker build -t cwbw/hadoop-historyserver ./hadoop/historyserver
	docker build -t cwbw/hadoop-submit ./hadoop/submit

.PHONY: build-zk
build-zk:
	docker build -t cwbw/zookeeper ./zookeeper/base

.PHONY: build-hbase
build-hbase:
	docker build -t cwbw/hbase-base ./hbase/base
	docker build -t cwbw/hbase-hmaster ./hbase/hmaster
	docker build -t cwbw/hbase-hregionserver ./hbase/hregionserver

.PHONY: build-dcfs
build-dcfs:
	docker build -t cwbw/dcfs-master ./dcfs/master
	docker build -t cwbw/dcfs-worker ./dcfs/worker

.PHONY: build-flask
build-flask:
	docker build -t cwbw/flask ./web/flask

.PHONY: run-flask
run-flask:
	docker run -d -p 5000:5000 --name flask -v $(shell pwd)/dcfs/dcfs-share:/dcfs-share -v $(shell pwd)/web/flask/flask-share:/flask-share -v $(shell pwd)/web/flask/hello.py:/hello.py -v $(shell pwd)/web/flask/flask_config.json:/flask_config.json -v $(shell pwd)/web/flask/db_config.json:/db_config.json -v $(shell pwd)/web/flask/template:/template -v $(shell pwd)/web/flask/static:/static --network hds_dcfs_docker_network --env-file ./web/flask/flask.env cwbw/flask

.PHONY: stop-flask
stop-flask:
	docker stop flask
	docker rm flask

.PHONY: restart-flask
restart-flask: stop-flask run-flask

.PHONY: add-regionserver
add-regionserver:
	docker run -d -p $(shell expr 7999 + $(id)):$(shell expr 7999 + $(id)) -p $(shell expr 16029 + $(id)):16030 --name hbase-regionserver$(id) --hostname hbase-regionserver$(id) -v $(shell pwd)/persistent_storage/hbase_regionserver$(id)/logs:/opt/hbase-2.3.5/logs --network hds_dcfs_docker_network --env-file ./hbase/hbase.env --env HBASE_CONF_hbase_zookeeper_quorum=zoo1,zoo2 --env HBASE_CONF_hbase_regionserver_hostname=hbase-regionserver$(id) --env HDS_CONF_hds_httpserver_port=$(shell expr 7999 + $(id)) --env HBASE_CONF_zookeeper_session_timeout=600000 --memory=10240M cwbw/hbase-hregionserver

.PHONY: up
up:
	docker network create -d bridge hds_dcfs_docker_network --ipam-driver default --subnet=172.22.0.0/16 || true
	docker-compose up -d

.PHONY: stop
stop:
	docker-compose stop -t 300
	docker stop flask
	docker rm flask

.PHONY: down
down:
	docker-compose stop -t 300
	docker stop flask
	docker rm flask
	docker-compose down
	docker network rm hds_dcfs_docker_network

.PHONY: restart
restart: stop up

.PHONY: logs
logs:
	docker logs $(name) -f

.PHONY: logs
bash:
	docker exec -t -i $(name) /bin/bash

.PHONY: pull
pull:
	docker-compose pull
