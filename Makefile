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

.PHONY: build-dcfs
build-dcfs:
	docker build -t dslab/dcfs-master ./dcfs/master
	docker build -t dslab/dcfs-worker ./dcfs/worker

.PHONY: build-flask
build-flask:
	docker build -t dslab/flask ./web/flask

.PHONY: run-flask
run-flask:
	docker run -d -p 5000:5000 --name flask -v $(shell pwd)/web/flask/flask-share:/flask-share -v $(shell pwd)/web/flask/hello.py:/hello.py -v $(shell pwd)/web/flask/template:/template -v $(shell pwd)/web/flask/static:/static --env-file ./web/flask/flask.env dslab/flask

.PHONY: run-mq
run-mq:
	docker run -d -p 15672:15672 --name rabbitmq -v $(shell pwd)/rabbitmq/rabbitmq.conf:/etc/rabbitmq/rabbitmq.conf rabbitmq:3.9.10-management

.PHONY: up
up:
	docker-compose up -d

.PHONY: stop
stop:
	docker-compose stop -t 60

.PHONY: down
down:
	docker-compose stop -t 60
	docker-compose down

.PHONY: restart
restart: stop up

.PHONY: logs
logs:
	docker logs $(name) -f

.PHONY: logs
bash:
	docker exec -t -i $(name) /bin/bash
