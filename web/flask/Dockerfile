FROM ubuntu:18.04

RUN apt-get update && apt-get install -y --no-install-recommends \
      gcc \
      libkrb5-dev \
      net-tools \
      curl \
      netcat \
      gnupg \
      libsnappy-dev \
      wget \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y --no-install-recommends \
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

ADD hello.py /hello.py
ADD static /static
ADD template /template

ADD entrypoint-flask.sh /entrypoint-flask.sh
RUN chmod a+x /entrypoint-flask.sh
# ENTRYPOINT ["/entrypoint-flask.sh"]
ADD run.sh /run.sh
RUN chmod a+x /run.sh
CMD ["/run.sh"]
