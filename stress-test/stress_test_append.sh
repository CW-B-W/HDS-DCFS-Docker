sh monitor_usage.sh
python3 stress_test.py 13 1
echo "Wait 30s for Phoenix to create first table"
sleep 30 
echo "Start sending append tasks"
python3 stress_test_append.py 13 29999
