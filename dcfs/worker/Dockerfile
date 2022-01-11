FROM dslab/hadoop-nodemanager

RUN apt-get update && DEBIAN_FRONTEND=noninteractive && apt-get install -y --no-install-recommends \
      build-essential \
      libkrb5-dev \
      wget \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && DEBIAN_FRONTEND=noninteractive && apt-get install -y --no-install-recommends \
      python-minimal \
      python-pip \
      python3 \
      python3-pip \
      python3-dev \
      alien \
      libaio1 \
      freetds-dev \
      freetds-bin \
    && rm -rf /var/lib/apt/lists/*

RUN wget -O /tmp/oracle-instantclient-basic-21.4.0.0.0-1.x86_64.rpm https://download.oracle.com/otn_software/linux/instantclient/214000/oracle-instantclient-basic-21.4.0.0.0-1.x86_64.rpm
RUN alien -i /tmp/oracle-instantclient-basic-21.4.0.0.0-1.x86_64.rpm

RUN pip3 install setuptools wheel
ADD requirements.txt /requirements.txt
RUN pip3 install -r requirements.txt

RUN wget -O /tmp/phoenix-hbase-2.3-5.1.2-bin.tar.gz https://archive.apache.org/dist/phoenix/phoenix-5.1.2/phoenix-hbase-2.3-5.1.2-bin.tar.gz
RUN tar -xvf /tmp/phoenix-hbase-2.3-5.1.2-bin.tar.gz -C /opt/ \
    && rm /tmp/phoenix-hbase-2.3-5.1.2-bin.tar.gz
ENV PHOENIX_HOME=/opt/phoenix-hbase-2.3-5.1.2-bin
ENV PATH $PHOENIX_HOME/bin/:$PATH

ADD run.sh /run.sh
RUN chmod a+x /run.sh

RUN apt-get update && DEBIAN_FRONTEND=noninteractive && apt-get install -y --no-install-recommends \
      cron \
    && rm -rf /var/lib/apt/lists/*
ADD crontab_cleantmp.sh /crontab_cleantmp.sh

CMD ["/run.sh"]
