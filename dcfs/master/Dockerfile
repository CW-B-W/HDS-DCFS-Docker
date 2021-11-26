FROM dslab/hadoop-resourcemanager

RUN apt-get update && DEBIAN_FRONTEND=noninteractive && apt-get install -y --no-install-recommends \
      python3 \
      python3-pip \
      python3-dev \
    && rm -rf /var/lib/apt/lists/*

ADD run.sh /run.sh
RUN chmod a+x /run.sh

ADD dcfs-job /dcfs-job

RUN chmod a+x /dcfs-job/dcfsJob

CMD ["/run.sh"]
