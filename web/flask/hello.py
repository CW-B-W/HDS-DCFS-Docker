#!/usr/bin/env python

import json

''' ========== TaskStatus ========== '''
import pika, sys, os, threading, time

lastest_message = "" # remember to declare `global` in functions
task_status_dict = {}

TASKSTATUS_ACCEPTED   = 1
TASKSTATUS_PROCESSING = 2
TASKSTATUS_SUCCEEDED  = 3
TASKSTATUS_FAILED     = 4
TASKSTATUS_ERROR      = 5
TASKSTATUS_UNKNOWN    = 6
def listen_task_status_queue():
    global lastest_message
    lastest_message = "consuming"

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

    channel.queue_declare(queue='task_status')

    def callback(ch, method, properties, body):
        global lastest_message
        print(" [x] Received %r" % body)
        lastest_message = body.decode('utf-8')
        add_task_status(json.loads(lastest_message))
        print("lastest_message = %s" % lastest_message)

    channel.basic_consume(queue='task_status', on_message_callback=callback, auto_ack=True)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()
    print('Consumer finished')

consumer_thread = threading.Thread(target=listen_task_status_queue)
consumer_thread.start()

def add_task_status(task_status):
    global task_status_dict
    task_id = str(task_status['task_id'])
    task_status_dict[task_id] = task_status

def get_task_status(task_id_list):
    global task_status_dict
    res_list = []
    if len(task_id_list) == 0:
        for k in task_status_dict:
            res_list.append(task_status_dict[k])
    for task_id in task_id_list:
        if task_id in task_status_dict:
            res_list.append(task_status_dict[task_id])
    return res_list
''' ========== TaskStatus  ========== '''



''' =============== MongoDB =============== '''
import pandas as pd
from pymongo import MongoClient
from bson import Code

def mongodb_list_all_dbs(username, password, ip, port):
    if username != '':
        mongo_client = MongoClient(f'mongodb://{username}:{password}@{ip}:{port}/')
    else:
        mongo_client = MongoClient(f'mongodb://{ip}:{port}/')
    return mongo_client.list_database_names()

def mongodb_list_all_tables(username, password, ip, port, db_name):
    if username != '':
        mongo_client = MongoClient(f'mongodb://{username}:{password}@{ip}:{port}/')
    else:
        mongo_client = MongoClient(f'mongodb://{ip}:{port}/')
    db = mongo_client[db_name]
    return db.list_collection_names()


def mongodb_list_all_keys(username, password, ip, port, db_name, table_name):
    if username != '':
        mongo_client = MongoClient(f'mongodb://{username}:{password}@{ip}:{port}/')
    else:
        mongo_client = MongoClient(f'mongodb://{ip}:{port}/')
    db = mongo_client[db_name]
    map = Code("function() { for (var key in this) { emit(key, null); } }")
    reduce = Code("function(key, stuff) { return null; }")
    result = db[table_name].map_reduce(map, reduce, "myresults")
    return result.distinct('_id')
''' =============== MongoDB =============== '''



''' ================ MySQL ================ '''
import pandas as pd
from pandasql import sqldf
from sqlalchemy import create_engine

def mysql_list_all_dbs(username, password, ip, port='3306'):
#db1_engine = create_engine(r"mysql+pymysql://brad:00000000@Brad-HDS-Master:3306/")
    db1_engine = create_engine("mysql+pymysql://%s:%s@%s:%s/" % (username, password, ip, port))
    df1 = pd.read_sql("SHOW DATABASES;", con=db1_engine)
    return df1.iloc[:,0].tolist()

def mysql_list_all_tables(db_name, username, password, ip, port='3306'):
#db1_engine = create_engine(r"mysql+pymysql://brad:00000000@Brad-HDS-Master:3306/%s" % db_name)
    db1_engine = create_engine("mysql+pymysql://%s:%s@%s:%s/%s" % (username, password, ip, port, db_name))
    df1 = pd.read_sql("SHOW TABLES", con=db1_engine)
    return df1.iloc[:,0].tolist()

def mysql_list_all_keys(db_name, table_name, username, password, ip, port='3306'):
#db1_engine = create_engine(r"mysql+pymysql://brad:00000000@Brad-HDS-Master:3306/%s" % db_name)
    db1_engine = create_engine("mysql+pymysql://%s:%s@%s:%s/%s" % (username, password, ip, port, db_name))
    df_col = pd.read_sql("SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA`='%s' AND `TABLE_NAME`='%s'" % (db_name, table_name), con=db1_engine);
    return df_col['COLUMN_NAME'].tolist()
''' ================ MySQL ================ '''



''' ================ MSSQL ================ '''
import pandas as pd
from pandasql import sqldf
from sqlalchemy import create_engine

def mssql_list_all_dbs(username, password, ip, port='1433'):
    db1_engine = create_engine("mssql+pymssql://%s:%s@%s:%s/" % (username, password, ip, port))
    df1 = pd.read_sql("SELECT name FROM master.dbo.sysdatabases", con=db1_engine)
    return df1.iloc[:,0].tolist()

def mssql_list_all_tables(db_name, username, password, ip, port='1433'):
    db1_engine = create_engine("mssql+pymssql://%s:%s@%s:%s/%s" % (username, password, ip, port, db_name))
    df1 = pd.read_sql("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'", con=db1_engine)
    return df1.iloc[:,2].tolist()

def mssql_list_all_keys(db_name, table_name, username, password, ip, port='1433'):
    db1_engine = create_engine("mssql+pymssql://%s:%s@%s:%s/%s" % (username, password, ip, port, db_name))
    df1 = pd.read_sql("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='%s' ORDER BY ORDINAL_POSITION" % table_name, con=db1_engine);
    return df1.iloc[:,0].tolist()
''' ================ MSSQL ================ '''



''' ================ Oracle ================ '''
import pandas as pd
from pandasql import sqldf
from sqlalchemy import create_engine
import cx_Oracle
from sqlalchemy import *
#db1_engine = create_engine(r"oracle+cx_oracle://brad:00000000@192.168.103.60:1521/?service_name=XEPDB1")

def oracle_list_all_dbs(username, password, ip, port='1521'):
    db1_engine = create_engine(r"oracle+cx_oracle://%s:%s@%s:%s/?service_name=XEPDB1" % (username, password, ip, port))
    df1 = pd.read_sql("select * from global_name", con=db1_engine)
    return df1.iloc[:,0].tolist()

def oracle_list_all_tables(db_name, username, password, ip, port='1521'):
    db1_engine = create_engine(r"oracle+cx_oracle://%s:%s@%s:%s/?service_name=%s" % (username, password, ip, port, db_name))
    df1 = pd.read_sql("SELECT table_name FROM user_tables", con=db1_engine)
    return df1.iloc[:,0].tolist()

def oracle_list_all_keys(db_name, table_name, username, password, ip, port='1521'):
    db1_engine = create_engine(r"oracle+cx_oracle://%s:%s@%s:%s/?service_name=%s" % (username, password, ip, port, db_name))
    df1 = pd.read_sql("SELECT column_name FROM all_tab_cols WHERE table_name = '%s'" % table_name, con=db1_engine);
    return df1.iloc[:,0].tolist()
''' ================ Oracle ================ '''



''' ================ Phoenix ================ '''
import phoenixdb
import phoenixdb.cursor
# database_url = 'http://192.168.103.53:8765/'

def phoenix_list_all_tables(ip='hbase-master', port='8765'):
    conn = phoenixdb.connect('http://%s:%s' % (ip, port))
    cursor = conn.cursor(cursor_factory=phoenixdb.cursor.DictCursor)
    cursor.execute("select DISTINCT(\"TABLE_NAME\") from SYSTEM.CATALOG")
    res = cursor.fetchall()
    l = [item['TABLE_NAME'] for item in res]
    return l

def phoenix_list_all_keys(table_name, ip='hbase-master', port='8765'):
    conn = phoenixdb.connect('http://%s:%s' % (ip, port))
    cursor = conn.cursor(cursor_factory=phoenixdb.cursor.DictCursor)
    cursor.execute("SELECT column_name FROM system.catalog WHERE table_name = '%s' AND column_name IS NOT NULL" % table_name)
    res = cursor.fetchall()
    l = [item['COLUMN_NAME'] for item in res]
    return l

def phoenix_list_all_types(table_name, ip='hbase-master', port='8765'):
    TYPE_MAP = {
         4 : 'INTEGER',
        -5 : 'BIGINT',
        -6 : 'TINYINT',
         5 : 'SMALLINT',
         6 : 'FLOAT',
         8 : 'DOUBLE',
         3 : 'DECIMAL',
        16 : 'BOOLEAN',
        92 : 'TIME',
        91 : 'DATE',
        93 : 'TIMESTAMP',
        12 : 'VARCHAR',
         1 : 'CHAR',
        -2 : 'BINARY',
        -3 : 'VARBINARY'
    }
    conn = phoenixdb.connect('http://%s:%s' % (ip, port))
    cursor = conn.cursor(cursor_factory=phoenixdb.cursor.DictCursor)
    cursor.execute("SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, KEY_SEQ FROM system.catalog WHERE TABLE_NAME = '%s' AND COLUMN_NAME IS NOT NULL" % table_name)
    res = cursor.fetchall()
    d = {}
    for item in res:
        d[item['COLUMN_NAME']] = TYPE_MAP[item['DATA_TYPE']]
    return d
''' ================ Phoenix ================ '''



''' ================ Elasticsearch ================ '''
from elasticsearch import Elasticsearch
#elasticsearch lib
import json
import pandas as pd
import numpy as np
from pandas.io.json import json_normalize
from elasticsearch_dsl import Search

def elasticsearch_list_all_dbs(username, password, ip, port='9200'):
    test=['test']
    return test

def elasticsearch_list_all_tables(db_name, username, password, ip, port='9200'):
    es=Elasticsearch(hosts=ip, port=9200)
    idx_list = [x for x in es.indices.get_alias("*").keys() ]
    return idx_list

def elasticsearch_list_all_keys(db_name, table_name, username, password, ip, port='9200'):
    es=Elasticsearch(hosts=ip, port=9200)
    result = es.indices.get_mapping(index = table_name)
    df=json_normalize(result[table_name])
    df1 = []
    for txt in df :
        data = txt.split(".")
        df1.append(data[2])
    return df1
    #print(df)
''' ================ Elasticsearch ================ '''



''' ================ cassandra ================ '''
import pandas as pd
from cassandra.cluster import Cluster
def cassandra_list_all_dbs(username, password, ip, port='9042'):
    #db1_engine = create_engine(r"oracle+cx_oracle://%s:%s@%s:%s/?service_name=XEPDB1" % (username, password, ip, port))
    #df1 = pd.read_sql("select * from global_name", con=db1_engine)
    cluster = Cluster([ip],port=9042)
    session = cluster.connect()
    rows = session.execute("DESCRIBE keyspaces;")
    df1 = pd.DataFrame(rows)
    return df1["keyspace_name"].tolist()

def cassandra_list_all_tables(db_name, username, password, ip, port='9042'):
    #db1_engine = create_engine(r"oracle+cx_oracle://%s:%s@%s:%s/%s" % (username, password, ip, port, db_name))
    #df1 = pd.read_sql("SELECT table_name FROM user_tables", con=db1_engine)
    #db1_engine = create_engine(r"oracle+cx_oracle://%s:%s@%s:%s/?service_name=%s" % (username, password, ip, port, db_name))
    #df1 = pd.read_sql("SELECT table_name FROM user_tables", con=db1_engine)
    cluster = Cluster([ip],port=9042)
    session = cluster.connect()
    rows = session.execute("SELECT * FROM system_schema.tables WHERE keyspace_name = '%s'" % (db_name))
    df1 = pd.DataFrame(rows)
    return df1["table_name"].tolist()

def cassandra_list_all_keys(db_name, table_name, username, password, ip, port='9042'):
    #db1_engine = create_engine(r"oracle+cx_oracle://%s:%s@%s:%s/?service_name=%s" % (username, password, ip, port, db_name))
    #df1 = pd.read_sql("SELECT column_name FROM all_tab_cols WHERE table_name = '%s'" % table_name, con=db1_engine);
    cluster = Cluster([ip],port=9042)
    session = cluster.connect()
    rows = session.execute("SELECT * FROM system_schema.columns WHERE keyspace_name = '%s'AND table_name = '%s'" % (db_name, table_name))
    df1 = pd.DataFrame(rows)
    return df1["column_name"].tolist()
    #return df1.iloc[:,0].tolist()
''' ================ cassandra ================ '''



''' ================ HBase ================ '''
import happybase
def hbase_list_all_dbs(username, password, ip, port='9090'):
    return ["Default"]

def hbase_list_all_tables(db_name, username, password, ip, port='9090'):
    connection = happybase.Connection(ip, port=int(port))
    l = []
    for x in connection.tables():
        l.append(x.decode("utf-8"))
    return l

def hbase_list_all_keys(db_name, table_name, username, password, ip, port='9090'):
    connection = happybase.Connection(ip, port=int(port))
    table = happybase.Table(table_name, connection)
    qualifiersSet = set()
    for keyx, valuex in table.scan():
        for keyy,valuey in valuex.items():
            qualifiersSet.add(keyy.decode("utf-8"))
    key_list = sorted(qualifiersSet)
    l = []
    for key in key_list:
        l.append(key.replace(":", "__"))
    return l
''' ================ HBase ================ '''



''' ================ Flask ================ '''
from flask import Flask, request, render_template
from flask import render_template
from flask import session
from flask_cors import CORS
#You need to use following line [app Flask(__name__]
app = Flask(__name__, template_folder='template')
class Config(object):
    SECRET_KEY = "DSLAB"
app.config.from_object(Config())
CORS(app)

@app.route('/hello')
def hello():
    print(session.get('id'))
    session['id'] = "hello"
    return 'Hello, Flask'

@app.route('/about/')
def about():
    return 'about Flask'

@app.route('/rabbitMQ')
def mq():
    global lastest_message
    print("/rabbitMQ: lastest_message=%s" % lastest_message)
    return lastest_message

val = 0
@app.route('/value')
def value():
    global val
    val += 1
    return str(val)

''' ----- MongoDB ----- '''
@app.route('/mongodb/listdbs', methods=['GET'])
def mongodb_dbs():
    username = request.args.get('username')
    password = request.args.get('password')
    ip       = request.args.get('ip')
    port     = request.args.get('port')
    ret_dict = {
        'db_list': mongodb_list_all_dbs(username, password, ip, port)
    }
    return ret_dict 

@app.route('/mongodb/listtables', methods=['GET'])
def mongodb_tables():
    username = request.args.get('username')
    password = request.args.get('password')
    ip       = request.args.get('ip')
    port     = request.args.get('port')
    db_name = request.args.get('db_name')
    ret_dict = {
        'table_list': mongodb_list_all_tables(username, password, ip, port, db_name)
    }
    return ret_dict 

@app.route('/mongodb/listkeys', methods=['GET'])
def mongodb_keys():
    username = request.args.get('username')
    password = request.args.get('password')
    ip       = request.args.get('ip')
    port     = request.args.get('port')
    db_name = request.args.get('db_name')
    table_name = request.args.get('table_name')
    ret_dict = {
        'key_list': mongodb_list_all_keys(username, password, ip, port, db_name, table_name)
    }
    return ret_dict 

''' ----- MySQL ----- '''
@app.route('/mysql/listdbs', methods=['GET'])
def mysql_dbs():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        ret_dict = {
            'db_list': mysql_list_all_dbs(username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to MySQL server", 403

@app.route('/mysql/listtables', methods=['GET'])
def mysql_tables():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        db_name  = request.args.get('db_name')
        ret_dict = {
            'table_list': mysql_list_all_tables(db_name, username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to MySQL server", 403

@app.route('/mysql/listkeys', methods=['GET'])
def mysql_keys():
    try:
        username   = request.args.get('username')
        password   = request.args.get('password')
        ip         = request.args.get('ip')
        port       = request.args.get('port')
        db_name    = request.args.get('db_name')
        table_name = request.args.get('table_name')
        ret_dict = {
            'key_list': mysql_list_all_keys(db_name, table_name, username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to MySQL server", 403

''' ----- MSSQL ----- '''
@app.route('/mssql/listdbs', methods=['GET'])
def mssql_dbs():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        ret_dict = {
            'db_list': mssql_list_all_dbs(username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to MSSQL server", 403

@app.route('/mssql/listtables', methods=['GET'])
def mssql_tables():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        db_name  = request.args.get('db_name')
        ret_dict = {
            'table_list': mssql_list_all_tables(db_name, username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to MSSQL server", 403

@app.route('/mssql/listkeys', methods=['GET'])
def mssql_keys():
    try:
        username   = request.args.get('username')
        password   = request.args.get('password')
        ip         = request.args.get('ip')
        port       = request.args.get('port')
        db_name    = request.args.get('db_name')
        table_name = request.args.get('table_name')
        ret_dict = {
            'key_list': mssql_list_all_keys(db_name, table_name, username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to MSSQL server", 403

''' ----- Oracle ----- '''
@app.route('/oracle/listdbs', methods=['GET'])
def oracle_dbs():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        ret_dict = {
            'db_list': oracle_list_all_dbs(username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to Oracle server", 403

@app.route('/oracle/listtables', methods=['GET'])
def oracle_tables():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        db_name  = request.args.get('db_name')
        ret_dict = {
            'table_list': oracle_list_all_tables(db_name, username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to Oracle server", 403

@app.route('/oracle/listkeys', methods=['GET'])
def oracle_keys():
    try:
        username   = request.args.get('username')
        password   = request.args.get('password')
        ip         = request.args.get('ip')
        port       = request.args.get('port')
        db_name    = request.args.get('db_name')
        table_name = request.args.get('table_name')
        ret_dict = {
            'key_list': oracle_list_all_keys(db_name, table_name, username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to Oracle server", 403

''' ----- Cassandra ----- '''
@app.route('/cassandra/listdbs', methods=['GET'])
def cassandra_dbs():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        ret_dict = {
            'db_list': cassandra_list_all_dbs(username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to Cassandra server", 403

@app.route('/cassandra/listtables', methods=['GET'])
def cassandra_tables():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        db_name = request.args.get('db_name')
        ret_dict = {
            'table_list': cassandra_list_all_tables(db_name, username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to Cassandra server", 403

@app.route('/cassandra/listkeys', methods=['GET'])
def cassandra_keys():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        db_name  = request.args.get('db_name')
        table_name = request.args.get('table_name')
        ret_dict = {
            'key_list': cassandra_list_all_keys(db_name, table_name, username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to Cassandra server", 403

''' ----- elasticsearch ----- '''
@app.route('/elasticsearch/listdbs', methods=['GET'])
def elasticsearch_dbs():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        ret_dict = {
            'db_list': elasticsearch_list_all_dbs(username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to elasticsearch server", 403

@app.route('/elasticsearch/listtables', methods=['GET'])
def elasticsearch_tables():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        db_name = request.args.get('db_name')
        ret_dict = {
            'table_list': elasticsearch_list_all_tables(db_name, username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to elasticsearch server", 403

@app.route('/elasticsearch/listkeys', methods=['GET'])
def elasticsearch_keys():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        db_name  = request.args.get('db_name')
        table_name = request.args.get('table_name')
        ret_dict = {
            'key_list': elasticsearch_list_all_keys(db_name, table_name, username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to elasticsearch server", 403

''' ----- HBase ----- '''
@app.route('/hbase/listdbs', methods=['GET'])
def hbase_dbs():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        ret_dict = {
            'db_list': hbase_list_all_dbs(username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to hbase server", 403

@app.route('/hbase/listtables', methods=['GET'])
def hbase_tables():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        db_name = request.args.get('db_name')
        ret_dict = {
            'table_list': hbase_list_all_tables(db_name, username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to hbase server", 403

@app.route('/hbase/listkeys', methods=['GET'])
def hbase_keys():
    try:
        username = request.args.get('username')
        password = request.args.get('password')
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        db_name  = request.args.get('db_name')
        table_name = request.args.get('table_name')
        ret_dict = {
            'key_list': hbase_list_all_keys(db_name, table_name, username, password, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to hbase server", 403

''' ----- Phoenix ----- '''
@app.route('/phoenix/listtables', methods=['GET'])
def phoenix_tables():
    try:
        ip       = request.args.get('ip')
        port     = request.args.get('port')
        ret_dict = {
            'table_list': phoenix_list_all_tables(ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to Phoenix server", 403

@app.route('/phoenix/listkeys', methods=['GET'])
def phoenix_keys():
    try:
        ip         = request.args.get('ip')
        port       = request.args.get('port')
        table_name = request.args.get('table_name')
        ret_dict = {
            'key_list': phoenix_list_all_keys(table_name, ip, port)
        }
        return ret_dict 
    except:
        return "Error connecting to Phoenix server", 403

@app.route('/phoenix/listtypes', methods=['GET'])
def phoenix_types():
    try:
        ip         = request.args.get('ip')
        port       = request.args.get('port')
        table_name = request.args.get('table_name')
        ret_dict   = phoenix_list_all_types(table_name, ip, port)
        return ret_dict 
    except:
        return "Error connecting to Phoenix server", 403

''' ----- TaskStatus ----- '''
@app.route('/taskstatus', methods=['GET'])
def task_status():
    task_id = request.args.get('task_id')
    try:
        if task_id is None:
            return json.dumps(get_task_status([]))
        else:
            return json.dumps(get_task_status(task_id.split(',')))
    except Exception as e:
        print(e)
        return "Task not found", 400
        
# ''' ----- HDS Download ----- '''
# import requests
# import uuid
# @app.route('/hds/task', methods=['GET'])
# def hds_task():
#     hds_ip   = request.args.get('ip')
#     hds_port = request.args.get('port')
#     hds_sql  = request.args.get('sql')
#     print(hds_sql)

#     flask_task_id = str(uuid.uuid4())
#     hds_url  = f'http://{hds_ip}:{hds_port}/dataservice/v1/access?from=jdbc:///&info=jdbc:phoenix:192.168.103.53:2181&query={hds_sql}&to=file:///tmp/flask/{flask_task_id}&async=true'
#     r = requests.get(hds_url)
#     if r.status_code == 200:
#         hds_task_id = r.json()['task']['id']
        
#         # HDS local protocol will not have redirection
#         if r.history:
#             for resp in r.history:
#                 print(resp.status_code, resp.url)
#         else:
#             print("No redirect")
#     else:
#         return "Failed to connect with HDS", 400

#     if session.get('task_list') is None:
#         session['task_list'] = {}
#     session['task_list'][hds_task_id] = flask_task_id

#     return r.json()

# @app.route('/hds/watch', methods=['GET'])
# def hds_watch():
#     hds_ip   = request.args.get('ip')
#     hds_port = request.args.get('port')

#     my_task_list = session.get('task_list')
#     if my_task_list is None:
#         return {}
    
#     hds_url = f'http://{hds_ip}:{hds_port}/dataservice/v1/watch?history=false'
#     r = requests.get(hds_url)
#     if r.status_code == 200:
#         my_runnung_task_list = [item['id'] for item in r.json()['task'] if item['id'] in my_task_list]
#         # my_runnung_task_list will be an array containing hds_task_ids
#     else:
#         return "Failed to connect with HDS", 400

#     my_finished_task_list = [t for t in my_task_list if not t in my_runnung_task_list]

#     if session.get('downloadable') is None:
#         session['downloadable'] = []
#     for t in my_finished_task_list:
#         flask_task_id = session['task_list'][t]
#         session['downloadable'].append(flask_task_id) 
    
#     print(my_runnung_task_list)
#     return r.json()

# @app.route('/hds/downloadable', methods=['GET'])
# def hds_downloadable():
#     hds_ip   = request.args.get('ip')
#     hds_port = request.args.get('port')

#     if session.get('downloadable') is None:
#         return ''
#     downloadable = session['downloadable']
#     downlinks = [f'http://{hds_ip}:{hds_port}/dataservice/v1/access?from=/tmp/flask/{ftid}&to=local:///' for ftid in downloadable]
#     return downlinks

@app.route('/')
def index():
    with open('./flask_config.json', 'r') as rf:
        flask_config = json.load(rf)
    with open('./db_config.json', 'r') as rf:
        db_config = json.load(rf)
    return render_template('index.html', flask_config = flask_config, db_config = db_config)

''' ================ Flask ================ '''