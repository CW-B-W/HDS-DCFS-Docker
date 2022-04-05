#!/usr/bin/env python
import pika, sys
import json
import requests
import urllib.parse
import time
import uuid

def send_task_req(task_info):    
    credentials = pika.PlainCredentials('guest', 'guest')
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host='127.0.0.1', credentials=credentials))
    channel = connection.channel()

    channel.queue_declare(queue='task_req')

    payload = task_info
    body = json.dumps(payload)

    channel.basic_publish(exchange='', routing_key='task_req', body=body)
    connection.close()


TASKSTATUS_ACCEPTED   = 1
TASKSTATUS_PROCESSING = 2
TASKSTATUS_SUCCEEDED  = 3
TASKSTATUS_FAILED     = 4
TASKSTATUS_ERROR      = 5
TASKSTATUS_UNKNOWN    = 6

def sync_send_task(task_info):
    task_id = task_info['task_id']
    send_task_req(task_info)
    time.sleep(1)
    status_url = f'http://192.168.103.48:5000/taskstatus?task_id={task_id}'
    while True:
        try:
            r = requests.get(status_url, timeout=10)
            if r.status_code == 200:
                task_status = r.json()
                print(task_status)
                if len(task_status) == 0:
                    pass
                else:
                    if task_status[0]['status'] == TASKSTATUS_SUCCEEDED:
                        print("Task succeeded")
                        return True
                    elif task_status[0]['status'] == TASKSTATUS_FAILED or task_status[0]['status'] == TASKSTATUS_ERROR or task_status[0]['status'] == TASKSTATUS_UNKNOWN:
                        print("Task failed")
                        return False
            else:
                return False
        except Exception as e:
            print(str(e))
            return False
        time.sleep(1)
    
    return False

def sync_download_table(table_name):
    # send table download request
    dlreq_uuid = str(uuid.uuid1())
    download_req_url = f'http://192.168.103.48:8000/dataservice/v1/access?from=jdbc:///&info=jdbc:phoenix:zoo1:2181&query=SELECT%20%2A%20FROM%20{table_name}&header=true&to=file:///tmp/web_download_tmp/result_{dlreq_uuid}.csv&async=true&redirectfrom=dcfs-worker1'
    try:
        r = requests.get(download_req_url, timeout=10)
        if r.status_code == 200:
            hds_download_taskid = r.json()['task']['id']
            pass
        else:
            print("Error in sending download request")
            return False
    except Exception as e:
        prints(str(e))
        return False
    
    time.sleep(1)
    # watch download task status
    hds_watch_id = urllib.parse.quote_plus(hds_download_taskid)
    watch_url = f'http://192.168.103.48:8000/dataservice/v1/watch?id={hds_watch_id}'
    while True:
        try:
            r = requests.get(watch_url, timeout=10)
            if r.status_code == 200:
                task_status = r.json()
                print(task_status)
                if len(task_status['task']) == 0:
                    print("Download task finished")
                    break
        except Exception as e:
            prints(str(e))
            return False
        time.sleep(1)

    time.sleep(1)
    # download the csv file
    download_url = f'http://192.168.103.48:8000/dataservice/v1/access?from=file:///tmp/web_download_tmp/result_{dlreq_uuid}.csv&to=local:///result.csv'
    try:
        r = requests.get(download_url, timeout=10)
        if r.status_code == 200:
            with open('./result.csv', 'wb') as f:
                f.write(r.content)
            return True
        else:
            print("Error in downloading csv")
            return False
    except Exception as e:
            prints(str(e))
            return False
    
    return False


def main():
    # generated from WebUI
    task_info = {
        "task_id":"c416c473-66a5-4b09-bbb8-1dc6fbab7c84",
        "task_list":[
            {
                "db":[
                    {
                        "type":"mysql",
                        "ip":"192.168.103.52",
                        "port":"3306",
                        "username":"brad",
                        "password":"00000000",
                        "db":"HDS_JDBC",
                        "sql":"SELECT ID, Math FROM SCORE;",
                        "namemapping":{
                            "ID":"ID",
                            "Math":"MATH"
                        }
                    },
                    {
                        "type":"mysql",
                        "ip":"192.168.103.52",
                        "port":"3306",
                        "username":"brad",
                        "password":"00000000",
                        "db":"HDS_JDBC",
                        "sql":"SELECT ID, Tennis FROM SCORE2;",
                        "namemapping":{
                            "ID":"ID",
                            "Tennis":"TENNIS"
                        }
                    }
                ],
                "join_sql":"SELECT COALESCE(df0.ID, df1.ID) as ID, df0.MATH as MATH, df1.TENNIS as TENNIS FROM df0 LEFT JOIN df1 ON df0.ID=df1.ID ;",
                "hds":{
                    "sql":"CREATE TABLE TEST_AUTO (ID VARCHAR, MATH VARCHAR, TENNIS VARCHAR, AUTOTIMESTAMP__ TIMESTAMP , CONSTRAINT pk PRIMARY KEY (AUTOTIMESTAMP__));",
                    "table":"TEST_AUTO",
                    "columns":[
                        "ID",
                        "MATH",
                        "TENNIS"
                    ]
                }
            }
        ]
    }

    task_ok = sync_send_task(task_info)

    if task_ok:
        sync_download_table(task_info['task_list'][-1]['hds']['table'])
    
    pass

if __name__ == '__main__':
    main()