import os
import sys
import time
from datetime import datetime
# add paths, otherwise python3 launched by DCFS would go wrong
for p in ['', '/usr/lib/python36.zip', '/usr/lib/python3.6', '/usr/lib/python3.6/lib-dynload', '/home/brad/.local/lib/python3.6/site-packages', '/usr/local/lib/python3.6/dist-packages', '/usr/lib/python3/dist-packages']:
    sys.path.append(p)
#sys.path.append('/home/brad/hadoop-3.2.2/bin')
import pandas as pd
from pandasql import sqldf
import sqlalchemy
from sqlalchemy import create_engine
import json
from pymongo import MongoClient
from cassandra.cluster import Cluster
from elasticsearch import Elasticsearch
#elasticsearch lib
from pandas.io.json import json_normalize
from elasticsearch_dsl import Search
import happybase

''' ========== RabbitMQ ========== '''
import pika, sys

TASKSTATUS_ACCEPTED   = 1
TASKSTATUS_PROCESSING = 2
TASKSTATUS_SUCCEEDED  = 3
TASKSTATUS_FAILED     = 4
TASKSTATUS_ERROR      = 5
TASKSTATUS_UNKNOWN    = 6
def send_task_status(task_id, status, message):
    credentials = pika.PlainCredentials('guest', 'guest')
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host='rabbitmq', credentials=credentials))
    channel = connection.channel()

    channel.queue_declare(queue='task_status')

    payload = {
        'task_id': task_id,
        'status': status,
        'message': message
    }
    body = json.dumps(payload)

    channel.basic_publish(exchange='', routing_key='task_status', body=body)
    connection.close()
''' ========== RabbitMQ ========== '''

try:
    taskinfo_filepath = sys.argv[1]
    if taskinfo_filepath[0:7] == 'file://':
        taskinfo_filepath = taskinfo_filepath[7:]
    print(taskinfo_filepath)
    with open(taskinfo_filepath, 'r') as rf:
        task_info = json.load(rf)

    task_id = str(task_info['task_id'])
except Exception as e:
    with open(taskinfo_filepath, 'r') as rf:
        content = rf.readlines()
    print(str(e))
    send_task_status(str(-1), TASKSTATUS_UNKNOWN, str(e))
    exit(1)

send_task_status(task_id, TASKSTATUS_PROCESSING, '')

for i, d in enumerate(task_info['db']):
    db_type = d['type']
    if db_type == 'mysql':
        try:
            username = d['username']
            password = d['password']
            ip       = d['ip']
            port     = d['port']
            db_name  = d['db']
            db_url   = 'mysql+pymysql://%s:%s@%s:%s/%s' % (username, password, ip, port, db_name)
            db_engine          = create_engine(db_url)
            send_task_status(task_id, TASKSTATUS_PROCESSING, "Retrieving data from MySQL")
            locals()['df%d'%i] = pd.read_sql(d['sql'], con=db_engine)
        except Exception as e:
            print(str(e))
            send_task_status(task_id, TASKSTATUS_FAILED, "Error in retrieving data from MySQL: " + str(e))
            exit(1)
    elif db_type == 'mssql':
        try:
            username = d['username']
            password = d['password']
            ip       = d['ip']
            port     = d['port']
            db_name  = d['db']
            db_url   = 'mssql+pymssql://%s:%s@%s:%s/%s' % (username, password, ip, port, db_name)
            db_engine          = create_engine(db_url)
            send_task_status(task_id, TASKSTATUS_PROCESSING, "Retrieving data from MSSQL")
            locals()['df%d'%i] = pd.read_sql(d['sql'], con=db_engine)
        except Exception as e:
            print(str(e))
            send_task_status(task_id, TASKSTATUS_FAILED, "Error in retrieving data from MSSQL: " + str(e))
            exit(1)
    elif db_type == 'oracle':
        try:
            username = d['username']
            password = d['password']
            ip       = d['ip']
            port_sid = d['port'] # e.g., 1521/sid
            db_name  = d['db'] # no need, replaced with port_sid
            db_url   = 'oracle+cx_oracle://%s:%s@%s:%s' % (username, password, ip, port_sid)
            db_engine          = create_engine(db_url)
            send_task_status(task_id, TASKSTATUS_PROCESSING, "Retrieving data from OracleDB")
            locals()['df%d'%i] = pd.read_sql(d['sql'], con=db_engine)
        except Exception as e:
            print(str(e))
            send_task_status(task_id, TASKSTATUS_FAILED, "Error in retrieving data from OracleDB: " + str(e))
            exit(1)
    elif db_type == 'cassandra':
        try:
            username = d['username']
            password = d['password']
            ip       = d['ip']
            port     = d['port']
            db_name  = d['db']
            cluster = Cluster([ip],port=port)
            session = cluster.connect()
            rows = session.execute(d['sql'])
#            local()['df%d'%i] = df1
#            db_url   = 'oracle+cx_oracle://%s:%s@%s:%s/?service_name=%s' % (username, password, ip, port, db_name)
#            db_engine          = create_engine(db_url)
            send_task_status(task_id, TASKSTATUS_PROCESSING, "Retrieving data from Cassandra")
            locals()['df%d'%i] = pd.DataFrame(rows)
        except Exception as e:
            print(str(e))
            send_task_status(task_id, TASKSTATUS_FAILED, "Error in retrieving data from Cassandra: " + str(e))
            exit(1)
    elif db_type == 'elasticsearch':
        try:
            username = d['username']
            password = d['password']
            ip       = d['ip']
            port     = d['port']
            db_name  = d['db']

            es=Elasticsearch(hosts=ip, port=port)
            result=es.sql.query(body={'query': d['sql']})
            col = []
            l = len(result['columns'])
            for x in range(l):
                col.append(result['columns'][x]['name'])
            #df = pd.DataFrame(result['rows'],columns =col)
            send_task_status(task_id, TASKSTATUS_PROCESSING, "Retrieving data from Elasticsearch")
            locals()['df%d'%i] = pd.DataFrame(result['rows'],columns =col)
        except Exception as e:
            print(str(e))
            send_task_status(task_id, TASKSTATUS_FAILED, "Error in retrieving data from Elasticsearch: " + str(e))
            exit(1)
    elif db_type == 'mongodb':
        try:
            username = d['username']
            password = d['password']
            ip       = d['ip']
            port     = d['port']
            db_name  = d['db']
            tbl_name = d['collection']
            if username != '':
                mongodb_client = MongoClient(f'mongodb://{username}:{password}@{ip}:{port}/')
            else:
                mongodb_client = MongoClient(f'mongodb://{ip}:{port}/')
            mongodb_db = mongodb_client[db_name]
            filterj    = d['sql']
            send_task_status(task_id, TASKSTATUS_PROCESSING, "Retrieving data from MongoDB")
            mongodb_cursor = mongodb_db[tbl_name].find({}, filterj)
            locals()['df%d'%i] = pd.DataFrame(list(mongodb_cursor))
        except Exception as e:
            print(str(e))
            send_task_status(task_id, TASKSTATUS_FAILED, "Error in retrieving data from MongoDB: " + str(e))
            exit(1)
    elif db_type == 'hbase':
        try:
            username = d['username']
            password = d['password']
            ip       = d['ip']
            port     = d['port']
            tbl_name = d['tblname']
            columns  = d['sql']

            send_task_status(task_id, TASKSTATUS_PROCESSING, "Retrieving data from HBase")

            connection = happybase.Connection(ip, port=int(port))
            table = happybase.Table(tbl_name, connection)
            b_columns = [str.encode(s) for s in columns]
            data = table.scan(columns = b_columns)

            my_generator = ((tuple([d[col].decode('utf-8') for col in b_columns])) for k, d in data)
            my_list = list(my_generator)
            my_data = pd.DataFrame(my_list, columns=columns)
            locals()['df%d'%i] = my_data
        except Exception as e:
            print(str(e))
            send_task_status(task_id, TASKSTATUS_FAILED, "Error in retrieving data from HBase: " + str(e))
            exit(1)
    else:
        print("Unsupported DB type " + db_type)
        send_task_status(task_id, TASKSTATUS_FAILED, "Unsupported DB type " + db_type)
        exit(1)

    # make all column names uppercase
    try:
        if 'namemapping' in d:
            namemapping = d['namemapping']
            # make mapping key uppercase
            namemapping =  {k.upper(): v for k, v in namemapping.items()}
            # make original columns uppercase
            locals()['df%d'%i].columns = map(str.upper, locals()['df%d'%i].columns)
            locals()['df%d'%i].rename(columns=namemapping, inplace=True)
        else:
            locals()['df%d'%i].columns = map(str.upper, locals()['df%d'%i].columns)
        print(locals()['df%d'%i])
    except Exception as e:
        print(str(e))
        send_task_status(task_id, TASKSTATUS_FAILED, "Error in renaming columns: " + str(e))
        exit(1)

if len(task_info['db']) < 2:
    df_joined = df0
else:
    # use pandasql to join tables
    try:
        pysqldf   = lambda q: sqldf(q, globals())
        send_task_status(task_id, TASKSTATUS_PROCESSING, "Joining two tables")
        df_joined = pysqldf(task_info['join_sql'])
    except Exception as e:
        print(str(e))
        send_task_status(task_id, TASKSTATUS_FAILED, "Error in joining the two tables: " + str(e))
        exit(1)

try:
    columns_order = task_info['hds']['columns']
    df_joined = df_joined.reindex(columns_order, axis=1)
    print(df_joined)
except Exception as e:
    print(str(e))
    send_task_status(task_id, TASKSTATUS_FAILED, "Error in joining the two tables. Please check if duplicated columns exist: " + str(e))
    exit(1)


# save to csv
ts = str(datetime.now().timestamp())
os.makedirs("/tmp/dcfs", exist_ok=True)
tmp_sql_path = '/tmp/dcfs/joined_' + task_id + ts + '.sql'
tmp_csv_path = '/tmp/dcfs/joined_' + task_id + ts + '.csv'
table_name = task_info['hds']['table']
with open(tmp_sql_path, 'w') as wf:
    wf.write(task_info['hds']['sql'])
df_joined.to_csv(tmp_csv_path, index=False, header=False)


''' ========== Phoenix ========== '''
import subprocess
#phoenix_home = os.environ['PHOENIX_HOME']
phoenix_home = "/opt/phoenix-hbase-2.3-5.1.2-bin"
if 'ip' in task_info['hds']:
    hds_ip = task_info['hds']['ip']
else:
    hds_ip = 'zoo1'
try:
    send_task_status(task_id, TASKSTATUS_PROCESSING, "Importing into HDS")
    cmd = phoenix_home+"/bin/psql.py %s -t \"%s\" %s %s" % (hds_ip, table_name.upper(), tmp_sql_path, tmp_csv_path)
    process = subprocess.Popen(cmd, shell=True, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    stdout, stderr = process.communicate()
    exit_code = process.wait()
    stdout = stdout.decode('utf-8')
    stderr = stderr.decode('utf-8')
except Exception as e:
    print(str(e))
    send_task_status(task_id, TASKSTATUS_FAILED, "Failed when importing table into HDS\n" + str(e))
    exit(1)

print("Phoenix stdout")
print(stdout)
print("Phoenix stderr")
print(stderr)
print(f"Phoenix exit code: {exit_code}")
if exit_code != 0:
    send_task_status(task_id, TASKSTATUS_FAILED, "Failed to import table into HDS\n" + stderr)
    exit(1)
else:
    send_task_status(task_id, TASKSTATUS_PROCESSING, "Successfully import table into HDS")
''' ========== Phoenix ========== '''

if stderr.find("ERROR") == -1:
    send_task_status(task_id, TASKSTATUS_SUCCEEDED, "Job finished")
else:
    send_task_status(task_id, TASKSTATUS_SUCCEEDED, "Job finished with error message: \n" + stderr)
exit()