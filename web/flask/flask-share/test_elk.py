from elasticsearch import Elasticsearch
#elasticsearch lib
import json
import pandas as pd
import numpy as np
from pandas.io.json import json_normalize
from elasticsearch_dsl import Search

def elasticsearch_list_all_dbs(username, password, ip, port='9200'):
    test = ['Default']
    return sorted(test)

def elasticsearch_list_all_tables(db_name, username, password, ip, port='9200'):
    es = Elasticsearch(hosts=ip, port=port, http_auth=(username, password))
    idx_list = [x for x in es.indices.get_alias().keys() ]
    return sorted(idx_list)

def elasticsearch_list_all_keys(db_name, table_name, username, password, ip, port='9200'):
    es = Elasticsearch(hosts=ip, port=port, http_auth=(username, password))
    mapping = es.indices.get_mapping(index = table_name)
    keys = []
    for index in mapping:
        for key in mapping[index]['mappings']['properties']:
            keys.append(key)
    print(keys)
    return sorted(keys)
    #print(df)

ip   = "192.168.103.125"
port = 9200
username = "brad"
password = "00000000"

elasticsearch_list_all_keys(None, 'score', username, password, ip, port)