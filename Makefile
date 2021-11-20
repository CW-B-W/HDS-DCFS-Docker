DOCKER_NETWORK = docker-hadoop_default
ENV_FILE = hadoop.env
build:
	docker build -t dslab/hadoop-base ./base
	docker build -t dslab/hadoop-namenode ./namenode
	docker build -t dslab/hadoop-datanode ./datanode
	docker build -t dslab/hadoop-resourcemanager ./resourcemanager
	docker build -t dslab/hadoop-nodemanager ./nodemanager
	docker build -t dslab/hadoop-historyserver ./historyserver
	docker build -t dslab/hadoop-submit ./submit
