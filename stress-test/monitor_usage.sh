nohup nice -n 10 python3 monitor_usage.py > monitor_usage.log 2>&1 &
tail -F system_usage.log