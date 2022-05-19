function cassandra_gen_sql(db_name, tbl_name, key_names) {
    sql = 'SELECT ';
    for (i in key_names) {
        key_name = key_names[i]
        sql += key_name + ', ';
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ' FROM ';
    sql += db_name + '.' + tbl_name;
    sql += ';';
    return sql;
}

function gen_db_info_cassandra(ip, port, username, password, dbname, tblname, keylist, namemapping, starttime, endtime, columnForTimeQuery) {
  db = {
      'type': 'cassandra',
      'ip': ip,
      'port': port,
      'username': username,
      'password': password,
      'db': dbname,
      'sql': cassandra_gen_sql(dbname, tblname, keylist),
      'namemapping': namemapping
  };

  return db;
}