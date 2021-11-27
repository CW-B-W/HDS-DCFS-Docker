FROM ubuntu:18.04
# FROM dslab/zookeeper

WORKDIR /

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      openjdk-8-jdk \
      net-tools \
      curl \
      netcat \
      gnupg \
      libsnappy-dev \
      wget \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && DEBIAN_FRONTEND=noninteractive && apt-get install -y --no-install-recommends \
      python-minimal \
      python-pip \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/

ENV HBASE_VERSION 2.3.5
ENV HBASE_URL https://archive.apache.org/dist/hbase/$HBASE_VERSION/hbase-$HBASE_VERSION-bin.tar.gz
RUN set -x \
    && curl -fSL "$HBASE_URL" -o /tmp/hbase.tar.gz \
    && curl -fSL "$HBASE_URL.asc" -o /tmp/hbase.tar.gz.asc \
    && tar -xvf /tmp/hbase.tar.gz -C /opt/ \
    && rm /tmp/hbase.tar.gz*

RUN ln -s /opt/hbase-$HBASE_VERSION/conf /etc/hbase
RUN mkdir /opt/hbase-$HBASE_VERSION/logs

ENV HBASE_HOME=/opt/hbase-$HBASE_VERSION
ENV HBASE_CONF_DIR=/etc/hbase

RUN wget -O /tmp/phoenix-hbase-2.3-5.1.2-bin.tar.gz https://dlcdn.apache.org/phoenix/phoenix-5.1.2/phoenix-hbase-2.3-5.1.2-bin.tar.gz
RUN tar -xvf /tmp/phoenix-hbase-2.3-5.1.2-bin.tar.gz -C /opt/ \
    && rm /tmp/phoenix-hbase-2.3-5.1.2-bin.tar.gz

ENV PHOENIX_HOME=/opt/phoenix-hbase-2.3-5.1.2-bin
ENV PATH $PHOENIX_HOME/bin/:$PATH
RUN cp $PHOENIX_HOME/phoenix-server-hbase-2.3-5.1.2.jar $HBASE_HOME/lib

ENV USER=root
ENV PATH $HBASE_HOME/bin/:$PATH
ENV PHOENIX_CLASSPATH=$PHOENIX_HOME

ADD entrypoint-hbase.sh /entrypoint-hbase.sh
RUN chmod a+x /entrypoint-hbase.sh

ENTRYPOINT ["/entrypoint-hbase.sh"]