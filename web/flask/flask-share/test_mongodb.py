import pandas as pd
from pymongo import MongoClient
from bson import Code

mongo_client = MongoClient('192.168.103.52', 27017)

def list_all_dbs():
    global mongo_client
    return mongo_client.list_database_names()

def list_all_tables(db_name):
    global mongo_client

def list_all_keys(db_name, table_name):
    db = mongo_client[db_name]
    map = Code("function() { for (var key in this) { emit(key, null); } }")
    reduce = Code("function(key, stuff) { return null; }")
    result = db[table_name].map_reduce(map, reduce, "myresults")
    return result.distinct('_id')

def list_all_keys_types(db_name, table_name):
    db = mongo_client[db_name]
    map = Code("function() { for (var key in this) { emit(key, this[key]); } }")
    reduce = Code("function(key, stuff) { return typeof(stuff).toString(); }")
    result = db[table_name].map_reduce(map, reduce, "myresults")
    result2 = pd.DataFrame(list(db[table_name].map_reduce(map, reduce, "myresults").find({})))
    print(result2)
    return result.distinct('_id')

def print_content(db_name, table_name):
    mongo_db     = mongo_client[db_name]
    mongo_cursor = mongo_db[table_name].find({}, {'_id':0}) # filter out the field '_id'
    df_mongo     = pd.DataFrame(list(mongo_cursor))
    print(df_mongo)
    print(type(df_mongo.iloc[0]['ID']))
    print(type(df_mongo.iloc[0]['Badminton']))
    '''
    df_mongo     = df_mongo.drop(columns=['_id'])
    print(df_mongo)
    '''

# field_names is a list containing the field names that we want
def print_certain_content(db_name, table_name, field_names):
    mongo_db     = mongo_client[db_name]
    field_filter = {'_id':0}
    for key in field_names:
        field_filter[key] = 1
    mongo_cursor = mongo_db[table_name].find({}, field_filter) # filter out the field '_id'
    df_mongo     = pd.DataFrame(list(mongo_cursor))
    print(df_mongo)
    '''
    df_mongo     = df_mongo.drop(columns=['_id'])
    print(df_mongo)
    '''



print_content('pd_test', 'score')
print_certain_content('pd_test', 'score', ['Tennis', 'Badminton'])
'''
keys = list_all_keys('pd_test', 'score')
print(keys)
'''
keys = list_all_keys_types('pd_test', 'score')
print(keys)