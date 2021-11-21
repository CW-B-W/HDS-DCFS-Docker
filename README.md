# Docker for HDRS

# How to
**set your configuration in `docker-compose.yml`**
## First to start a network
#### To start network
```
sudo make network
```
#### To remove network
```
sudo make network-rm
```

## Start the cluster
**MUST start the network first**
```
sudo make up
```
## Stop the cluster
```
sudo make down
```

## build all docker images
```
sudo make build
```
### build only hadoop images
```
sudo make build-hadoop
```
### build only zookeeper images
```
sudo make build-zk
```
### build only hbase images
```
sudo make build-hbase
```

### view logs of a container
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
