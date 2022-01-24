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
        for layer1 in mapping[index]['mappings']['properties']:
            if 'properties' in mapping[index]['mappings']['properties'][layer1]:
                for layer2 in mapping[index]['mappings']['properties'][layer1]['properties']:
                    keys.append(layer1 + '.' + layer2)
            else:
                keys.append(layer1)
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
    print(res['hits']['hits'][0]['_source']['host']['ip'])
    # print(res['hits']['hits'][1]['_source'])

ip   = "192.168.103.125"
port = 9200
username = "brad"
password = "00000000"

# elasticsearch_list_all_keys(None, 'score', username, password, ip, port)
# elasticsearch_list_all_keys(None, 'test-dash', username, password, ip, port)

elasticsearch_get(None, 'test-dash', username, password, ip, port)