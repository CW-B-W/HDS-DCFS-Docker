echo "Wait 120s before start"
sleep 120
echo "Start monitoring"
while true
do
    if ! pgrep -f 'Dproc_regionserver' > /dev/null; then
        echo "regionserver not found, restarting"
        /opt/hbase-$HBASE_VERSION/bin/hbase-daemon.sh start regionserver
    fi
    sleep 3
done
