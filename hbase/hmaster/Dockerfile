FROM cwbw/hbase-base

RUN apt-get update && DEBIAN_FRONTEND=noninteractive && apt-get install -y --no-install-recommends \
      python3 \
      python3-pip \
      python3-dev \
    && rm -rf /var/lib/apt/lists/*
RUN pip3 install setuptools wheel
RUN apt-get update
RUN apt-get -y install gcc libkrb5-dev
ADD requirements.txt /requirements.txt
RUN pip3 install -r requirements.txt
ADD crawler.py /crawler.py

ADD run.sh /run.sh
RUN chmod a+x /run.sh

EXPOSE 16000 16010 8765

CMD ["/run.sh"]
