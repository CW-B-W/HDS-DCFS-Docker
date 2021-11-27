# Docker for HDRS

# Quick Start
1. Build docker images
```
sudo make build-bg     # build docker in background
sudo make build-bg-log # view logs, can use ctrl-c to exit
```

2. Start the cluster
```
sudo make up
```

3. Stop the cluster
```
sudo make stop
```

# How to
**set your configuration in `docker-compose.yml`**

## Start the cluster
```
sudo make up
```

## Stop the cluster
```
sudo make stop
```

## Restart the cluster
```
sudo make restart
```

## Stop & Remove the cluster
```
sudo make down
```

## Enter container's bash
```
sudo make bash name=...
```

## build all docker images in background
```
sudo make build-bg

# to view build-log
make build-bg-log
```

## build all docker images in foreground
```
sudo make build
```

## enter the bash of a container
```
sudo make bash name=...
```
e.g.
```
sudo make bash name=hbase-regionserver
```

## view logs of a container
```
sudo make logs name=...
```
e.g.
```
sudo make logs name=hbase-regionserver
```

# Acknowledgements
This project referenced the following repos  
[big-data-europe/docker-hadoop](https://github.com/big-data-europe/docker-hadoop)  
[big-data-europe/docker-hbase](https://github.com/big-data-europe/docker-hbase/tree/master/distributed)  
[31z4/zookeeper-docker](https://github.com/31z4/zookeeper-docker/issues)
