FROM dslab/hbase-base

ADD run.sh /run.sh
RUN chmod a+x /run.sh

EXPOSE 16020 16030

ADD hdrs-1.1.0-without-cdh-bin.tar.gz /opt
RUN echo "export HBASE_CLASSPATH=/opt/hdrs-1.1.0-without-cdh/lib/*" >> $HBASE_CONF_DIR/hbase-env.sh

ADD entrypoint-hdrs.sh /entrypoint-hdrs.sh
RUN chmod a+x /entrypoint-hdrs.sh

RUN apt-get update && DEBIAN_FRONTEND=noninteractive && apt-get install -y --no-install-recommends \
      cron \
    && rm -rf /var/lib/apt/lists/*
ADD crontab_cleantmp.sh /crontab_cleantmp.sh

ENTRYPOINT ["/entrypoint-hdrs.sh"]
CMD ["/run.sh"]