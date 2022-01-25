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
    mapping = es.indices.get_mapping(index = table_name)[table_name]['mappings']
    keys = []
    
    def dfs_mapping(prefix, d):
        if 'properties' in d:
            for key in d['properties']:
                next_key = prefix + '.' + key if prefix != '' else key
                dfs_mapping(next_key, d['properties'][key])
        else:
            keys.append(prefix)
    
    dfs_mapping('', mapping)
    
    print(keys)
    return sorted(keys)

def elasticsearch_get(db_name, table_name, username, password, ip, port='9200'):
    es = Elasticsearch(hosts=ip, port=port, http_auth=(username, password))
    # s = Search(using=es, index=table_name)
    # s.source(["chinese", "math"])
    # s.query("match_all")

    # response = s.execute()
    # print(response)
    res = es.search(index=table_name, _source=['host.ip', 'host.os', 'host.architecture'])
    # print(res)
    # print(res['hits'])
    # print(res['hits']['hits'][0]['_source'])
    # print(res['hits']['hits'][1]['_source'])
    def dfs_dict(prefix, d):
        for key in d:
            item = d[key]
            next_key = (prefix + '.' + key) if prefix != '' else key
            if type(item) == dict:
                dfs_dict(next_key, item)
            else:
                print(next_key)
    hits = res['hits']['hits']
    for hit in hits:
        val_dict = hit['_source']
        dfs_dict('', val_dict)

ip   = "192.168.103.125"
port = 9200
username = "brad"
password = "00000000"

elasticsearch_list_all_keys(None, 'score', username, password, ip, port)
elasticsearch_list_all_keys(None, 'test-dash', username, password, ip, port)

# elasticsearch_get(None, 'test-dash', username, password, ip, port)