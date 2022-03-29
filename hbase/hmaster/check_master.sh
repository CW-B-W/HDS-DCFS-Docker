echo "Wait 120s before start"
sleep 120
echo "Start monitoring"
while true
do
    if ! pgrep -f 'Dproc_master' > /dev/null; then
        echo "master not found, restarting"
        /opt/hbase-$HBASE_VERSION/bin/hbase-daemon.sh start master
    fi
    sleep 3
done
