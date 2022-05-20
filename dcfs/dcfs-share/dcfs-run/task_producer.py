#!/usr/bin/env python
import pika, sys
import json

credentials = pika.PlainCredentials('guest', 'guest')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq', credentials=credentials))
channel = connection.channel()

channel.queue_declare(queue='task_req')

payload = json.dumps({
   "task_id":"brad_single_join",
   "db":[
      {
         "type":"oracle",
         "username":"brad",
         "password":"00000000",
         "ip":"192.168.103.60",
         "port":"49161",
         "db":"XEPDB1",
         "sql":"SELECT ID, CHINESE, MATH FROM SCORE_1"
      }
   ],
   "hds":{
      "sql":"CREATE TABLE IF NOT EXISTS SINGLE_JOIN (ID INTEGER PRIMARY KEY, CHINESE INTEGER, MATH INTEGER);",
      "table":"single_join",
      "columns":[
         "ID",
         "CHINESE",
         "MATH"
      ]
   }
})

channel.basic_publish(exchange='', routing_key='task_req', body=payload)
print(" [x] Sent '%s'" % sys.argv[1])
connection.close()