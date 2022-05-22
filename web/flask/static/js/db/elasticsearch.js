function elasticsearch_gen_sql(key_names) {
    return key_names
}

function gen_db_info_elasticsearch(ip, port, username, password, dbname, tblname, keylist, namemapping, starttime, endtime, time_column) {
  db = {
      'type': 'elasticsearch',
      'ip': ip,
      'port': port,
      'username': username,
      'password': password,
      'db': dbname,
      'index': tblname,
      'sql': elasticsearch_gen_sql(keylist),
      'namemapping': namemapping,
      'starttime': starttime,
      'endtime': endtime,
      'filter':''
  };

  return db;
}