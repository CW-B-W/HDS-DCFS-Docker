nohup nice -n 10 python3 monitor_usage.py > monitor_usage.log 2>&1 &
nohup nice -n 10 python3 monitor_regionserver.py > monitor_regionserver.log 2>&1 &
