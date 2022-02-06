#!/usr/bin/env python
import pika, sys
import json

def get_tbl_id(n_row):
    return f'r{n_row}_c10'

def gen_task_info(taskid, tblname, tbl1_n_row, tbl2_n_row):
    with open('/dcfs-share/dcfs-stress/task_template.json') as rf:
        raw_text = rf.read() \
            .replace("_TASKID_", taskid) \
            .replace("_TBLNAME_", tblname.upper()) \
            .replace("_TBL1ID_LO_", get_tbl_id(tbl1_n_row)) \
            .replace("_TBL1ID_HI_", get_tbl_id(tbl1_n_row).upper()) \
            .replace("_TBL2ID_LO_", get_tbl_id(tbl2_n_row)) \
            .replace("_TBL2ID_HI_", get_tbl_id(tbl2_n_row).upper())
        task_info = json.loads(raw_text)
        return task_info

def send_task_req(task_info):    
    credentials = pika.PlainCredentials('guest', 'guest')
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host='rabbitmq', credentials=credentials))
    channel = connection.channel()

    channel.queue_declare(queue='task_req')

    payload = task_info
    body = json.dumps(payload)

    channel.basic_publish(exchange='', routing_key='task_req', body=body)
    connection.close()

for t in range(1000):
    task_info = gen_task_info(f'stress1280_{t}', f'stress1280_{t}', 1280, 1280)
    send_task_req(task_info)