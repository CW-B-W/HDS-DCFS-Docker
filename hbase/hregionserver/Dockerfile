FROM cwbw/hbase-base

ADD run.sh /run.sh
RUN chmod a+x /run.sh

EXPOSE 16020 16030

ADD hdrs-1.1.0-without-cdh-bin.tar.gz /opt
RUN echo "export HBASE_CLASSPATH=/opt/hdrs-1.1.0-without-cdh/lib/*" >> $HBASE_CONF_DIR/hbase-env.sh

ADD entrypoint-hdrs.sh /entrypoint-hdrs.sh
RUN chmod a+x /entrypoint-hdrs.sh
ENTRYPOINT ["/entrypoint-hdrs.sh"]
CMD ["/run.sh"]