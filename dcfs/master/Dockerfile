FROM cwbw/hadoop-resourcemanager

RUN apt-get update && DEBIAN_FRONTEND=noninteractive && apt-get install -y --no-install-recommends \
      python3 \
      python3-pip \
      python3-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install setuptools wheel
ADD requirements.txt /requirements.txt
RUN pip3 install -r requirements.txt

ADD run.sh /run.sh
RUN chmod a+x /run.sh

CMD ["/run.sh"]
