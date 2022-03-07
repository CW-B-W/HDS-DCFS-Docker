import os
import sys
import time
import logging
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
from elasticsearch import helpers
#elasticsearch lib
from pandas.io.json import json_normalize
from elasticsearch_dsl import Search
import happybase

def setup_logging(filename):
    save_dir = r'/dcfs-share/task-logs/'
    logging.basicConfig(level=logging.DEBUG,
                    # format='%(asctime)s - %(levelname)s - %(message)s',
                    format='%(asctime)s - [%(levelname)s]\n%(message)s\n[%(pathname)s %(funcName)s %(lineno)d]\n',
                    filename=save_dir+filename,
                    filemode='w')
    # Until here logs only to file: 'logs_file'

    # define a new Handler to log to console as well
    console = logging.StreamHandler()
    # optional, set the logging level
    console.setLevel(logging.DEBUG)
    # set a format which is the same for console use
    # formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    formatter = logging.Formatter('%(asctime)s - [%(levelname)s]\n%(message)s\n[%(pathname)s %(funcName)s %(lineno)d]\n')
    # tell the handler to use this format
    console.setFormatter(formatter)
    # add the handler to the root logger
    logging.getLogger().addHandler(console)

    # Set all other logger levels to WARNING
    for logger_name in logging.root.manager.loggerDict:
        if logger_name != __name__:
            logger = logging.getLogger(logger_name)
            logger.setLevel(logging.WARNING)
    
    # for logger in loggers:


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
    print(str(e), file=sys.stderr)
    send_task_status(str(-1), TASKSTATUS_UNKNOWN, str(e))
    exit(1)

ts = str(datetime.now().timestamp())
setup_logging('joined_' + task_id + '_' + ts + '.log');
logging.info('Task started. task_id = ' + task_id)
send_task_status(task_id, TASKSTATUS_PROCESSING, '')

logging.info('Task info:\n' + json.dumps(task_info))

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
            logging.info("Retrieving data from MySQL")
            send_task_status(task_id, TASKSTATUS_PROCESSING, "Retrieving data from MySQL")
            locals()['df%d'%i] = pd.read_sql(d['sql'], con=db_engine)
        except Exception as e:
            logging.error("Error in retrieving data from MySQL: " + str(e))
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
            logging.info("Retrieving data from MSSQL")
            send_task_status(task_id, TASKSTATUS_PROCESSING, "Retrieving data from MSSQL")
            locals()['df%d'%i] = pd.read_sql(d['sql'], con=db_engine)
        except Exception as e:
            logging.error("Error in retrieving data from MSSQL: " + str(e))
            send_task_status(task_id, TASKSTATUS_FAILED, "Error in retrieving data from MSSQL: " + str(e))
            exit(1)
    elif db_type == 'oracle':
        try:
            username  = d['username']
            password  = d['password']
            ip        = d['ip']
            port_sid  = d['port'] # e.g., 1521/sid
            db_name   = d['db'] # no need, replaced with port_sid
            db_url    = 'oracle+cx_oracle://%s:%s@%s:%s' % (username, password, ip, port_sid)
            db_engine = create_engine(db_url)
            logging.info("Retrieving data from OracleDB")
            send_task_status(task_id, TASKSTATUS_PROCESSING, "Retrieving data from OracleDB")
            locals()['df%d'%i] = pd.read_sql(d['sql'], con=db_engine)
        except Exception as e:
            logging.error("Error in retrieving data from OracleDB: " + str(e))
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
            logging.info("Retrieving data from Cassandra")
            send_task_status(task_id, TASKSTATUS_PROCESSING, "Retrieving data from Cassandra")
            locals()['df%d'%i] = pd.DataFrame(rows)
        except Exception as e:
            logging.error("Error in retrieving data from Cassandra: " + str(e))
            send_task_status(task_id, TASKSTATUS_FAILED, "Error in retrieving data from Cassandra: " + str(e))
            exit(1)
    elif db_type == 'elasticsearch':
        try:
            username   = d['username']
            password   = d['password']
            ip         = d['ip']
            port       = d['port']
            db_name    = d['db']
            index_name = d['index']
            keynames   = d['sql']

            time_from = d['starttime']
            time_end  = d['endtime']
            es = Elasticsearch(hosts=ip, port=port, http_auth=(username, password))
            es_result = helpers.scan(
                client = es,
                query = {
                    "query" : {
                        "bool": {
                            "filter":[
                                
                            ]
                        }
                    },
                },
                _source = keynames,
                index   = index_name,
                scroll  ='10m',
                timeout ="10m"
            )

            rows = []
            for k in es_result:
                val_dict = k['_source']
                tmp_dict = {}
                for keyname in keynames:
                    if keyname.find('.') != -1:
                        keys = keyname.split('.')
                        val = val_dict
                        for layer in range(len(keys)):
                            val = val[keys[layer]]
                    else:
                        val = val_dict[keyname]
                        
                    if type(val) == dict or type(val) == list:
                        val = json.dumps(val)
                        
                    tmp_dict[keyname] = val
                rows.append(tmp_dict)
            
            logging.info("Retrieving data from Elasticsearch")
            send_task_status(task_id, TASKSTATUS_PROCESSING, "Retrieving data from Elasticsearch")
            locals()['df%d'%i] = pd.DataFrame(rows, columns=keynames)
        except Exception as e:
            logging.error("Error in retrieving data from Elasticsearch: " + str(e))
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
            logging.info("Retrieving data from MongoDB")
            send_task_status(task_id, TASKSTATUS_PROCESSING, "Retrieving data from MongoDB")
            mongodb_cursor = mongodb_db[tbl_name].find({}, filterj)
            locals()['df%d'%i] = pd.DataFrame(list(mongodb_cursor))
        except Exception as e:
            logging.error("Error in retrieving data from MongoDB: " + str(e))
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

            logging.info("Retrieving data from HBase")
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
            logging.error("Error in retrieving data from HBase: " + str(e))
            send_task_status(task_id, TASKSTATUS_FAILED, "Error in retrieving data from HBase: " + str(e))
            exit(1)
    elif db_type == 'excel':
        try:
            filedir  = d['db']
            filename = d['tblname']
            filepath = filedir + '/' + filename
            columns  = d['sql']

            logging.info("Reading xls file")
            send_task_status(task_id, TASKSTATUS_PROCESSING, "Reading xls file")

            my_data = pd.read_excel(filepath)
            pysqldf = lambda q: sqldf(q, globals())
            my_data = pysqldf(columns)

            locals()['df%d'%i] = my_data
        except Exception as e:
            logging.error("Error in opening xls file: " + str(e))
            send_task_status(task_id, TASKSTATUS_FAILED, "Error in opening xls file: " + str(e))
            exit(1)
    else:
        logging.error("Unsupported DB type " + db_type)
        send_task_status(task_id, TASKSTATUS_FAILED, "Unsupported DB type " + db_type)
        exit(1)
    logging.info(f'Finished retrieving table {i} from {db_type}')
    
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
        logging.debug(str(locals()['df%d'%i]))
    except Exception as e:
        logging.error("Error in renaming columns: " + str(e))
        send_task_status(task_id, TASKSTATUS_FAILED, "Error in renaming columns: " + str(e))
        exit(1)

if len(task_info['db']) < 2:
    df_joined = df0
else:
    # use pandasql to join tables
    try:
        pysqldf   = lambda q: sqldf(q, globals())
        logging.info('Start joining two tables')
        send_task_status(task_id, TASKSTATUS_PROCESSING, "Start joining two tables")
        df_joined = pysqldf(task_info['join_sql'])
        logging.info('Finished joining two tables')
        send_task_status(task_id, TASKSTATUS_PROCESSING, "Finished joining two tables")
    except Exception as e:
        logging.error("Error in joining the two tables: " + str(e))
        send_task_status(task_id, TASKSTATUS_FAILED, "Error in joining the two tables: " + str(e))
        exit(1)

try:
    columns_order = task_info['hds']['columns']
    print(columns_order)
    df_joined = df_joined.reindex(columns_order, axis=1)
    logging.debug(str(df_joined))
except Exception as e:
    logging.error("Error in joining the two tables. Please check if duplicated columns exist: " + str(e))
    send_task_status(task_id, TASKSTATUS_FAILED, "Error in joining the two tables. Please check if duplicated columns exist: " + str(e))
    exit(1)

# auto add primary key if not have one
def generate_phoenix_autotimestamp():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")

if task_info['hds']['sql'].find('AUTOTIMESTAMP__') >= 0:
    autotimestamp = [generate_phoenix_autotimestamp() for t in range(df_joined.shape[0])]
    df_joined['AUTOTIMESTAMP__'] = autotimestamp

# save to csv
os.makedirs("/tmp/dcfs", exist_ok=True)
tmp_sql_path = '/tmp/dcfs/joined_' + task_id + '_' + ts + '.sql'
tmp_csv_path = '/tmp/dcfs/joined_' + task_id + '_' + ts + '.csv'
table_name = task_info['hds']['table']
with open(tmp_sql_path, 'w') as wf:
    # special case for append task
    if task_info['hds']['sql'] != 'AUTOTIMESTAMP__':
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
    logging.info('Start importing table into HDS')
    send_task_status(task_id, TASKSTATUS_PROCESSING, "Start importing table into HDS")
    cmd = phoenix_home+"/bin/psql.py %s -t \"%s\" %s %s" % (hds_ip, table_name.upper(), tmp_sql_path, tmp_csv_path)
    process = subprocess.Popen(cmd, shell=True, stderr=subprocess.PIPE, stdout=subprocess.PIPE)
    stdout, stderr = process.communicate()
    exit_code = process.wait()
    stdout = stdout.decode('utf-8')
    stderr = stderr.decode('utf-8')
    logging.info('Finished importing table into HDS')
    send_task_status(task_id, TASKSTATUS_PROCESSING, "Finished importing table into HDS")
except Exception as e:
    logging.error("Failed when importing table into HDS\n" + str(e))
    send_task_status(task_id, TASKSTATUS_FAILED, "Failed when importing table into HDS\n" + str(e))
    exit(1)

logging.debug("Phoenix stdout\n" + stdout)
logging.debug("Phoenix stderr\n" + stderr)
logging.debug(f"Phoenix exit code: {exit_code}")
if exit_code != 0:
    logging.error("Failed to import table into HDS\n" + stderr)
    send_task_status(task_id, TASKSTATUS_FAILED, "Failed to import table into HDS\n" + stderr)
    exit(1)
else:
    logging.error("Successfully importing table into HDS" + stderr)
    send_task_status(task_id, TASKSTATUS_PROCESSING, "Successfully importing table into HDS")
''' ========== Phoenix ========== '''

if stderr.find("ERROR") == -1:
    logging.error("Job finished")
    send_task_status(task_id, TASKSTATUS_SUCCEEDED, "Job finished")
else:
    logging.error("Job finished with error message: \n" + stderr)
    send_task_status(task_id, TASKSTATUS_SUCCEEDED, "Job finished with error message: \n" + stderr)
exit()