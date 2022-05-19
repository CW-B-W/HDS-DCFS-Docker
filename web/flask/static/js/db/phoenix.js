function phoenix_gen_sql(tbl_name, key_names) {
    sql = 'SELECT ';
    for (i in key_names) {
        key_name = key_names[i]
        sql += key_name + ', ';
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ' FROM ';
    sql += tbl_name;
    //sql += ';'; ==> phoenix dont need ";"
    return sql;
}

function gen_db_info_phoenix(ip, port, username, password, dbname, tblname, keylist, namemapping, starttime, endtime, columnForTimeQuery) {
  db = {
      'type': 'phoenix',
      'ip': ip,
      'port': port,
      'username': username,
      'password': password,
      'db': dbname,
      'sql': phoenix_gen_sql(tblname, keylist),
      'namemapping': namemapping,
      'starttime': starttime,
      'endtime': endtime
  };

  return db;
}