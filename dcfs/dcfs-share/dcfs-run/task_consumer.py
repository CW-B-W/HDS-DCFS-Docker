#!/usr/bin/env python
import pika, sys, os
import urllib.parse
import json
import time

def main():
    try_times = 10
    while try_times > 0:
        try:
            credentials = pika.PlainCredentials('guest', 'guest')
            connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq', credentials=credentials))
            channel = connection.channel()
            break
        except:
            try_times -= 1
            if try_times >= 1:
                print("Connection failed. Retry in 3 seconds")
                time.sleep(3)

    channel.queue_declare(queue='task_req')

    def callback(ch, method, properties, body):
        body = urllib.parse.unquote(body.decode('utf-8'))
        print(" [x] Received %s" % body)
        try:
            task_info = json.loads(body)
            task_id = task_info['task_id']
            with open('/dcfs-share/dcfs-watch/%s.json' % task_id, 'w') as wf:
                wf.write(body)
        except:
            pass

    channel.basic_consume(queue='task_req', on_message_callback=callback, auto_ack=True)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)