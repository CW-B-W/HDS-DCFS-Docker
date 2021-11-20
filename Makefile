DOCKER_NETWORK = docker-hadoop_default
ENV_FILE = hadoop.env

.PHONY: build
build:
	docker build -t dslab/hadoop-base ./base
	docker build -t dslab/hadoop-namenode ./namenode
	docker build -t dslab/hadoop-datanode ./datanode
	docker build -t dslab/hadoop-resourcemanager ./resourcemanager
	docker build -t dslab/hadoop-nodemanager ./nodemanager
	docker build -t dslab/hadoop-historyserver ./historyserver
	docker build -t dslab/hadoop-submit ./submit

.PHONY: network
network:
	docker network create --attachable hdrs
#docker network create -d overlay --attachable hdrs

.PHONY: network-rm
network-rm:
	docker network rm hdrs

.PHONY: up
up:
	docker-compose up -d

.PHONY: down
down:
	docker-compose down
