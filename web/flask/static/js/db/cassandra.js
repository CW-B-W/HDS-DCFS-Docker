function cassandra_gen_sql(db_name, tbl_name, key_names, starttime, endtime, time_column) {
    sql = 'SELECT ';
    for (i in key_names) {
        key_name = key_names[i]
        sql += key_name + ', ';
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ' FROM ';
    sql += db_name + '.' + tbl_name;
    if (time_column != "None" && starttime != "" && endtime != "") {
       // example: SELECT * FROM table WHERE time_column >= 'starttime' AND  time_column <= 'endtime';
        sql += ' WHERE ';
        sql += time_column;
        sql += ' >= \'';
        sql += starttime;
        sql += '\'AND ';
        sql += time_column;
        sql += ' <=\'';
        sql += endtime;
        sql += '\';';
        return sql;
    } 
    sql += ';';
    return sql;
}

function gen_db_info_cassandra(ip, port, username, password, dbname, tblname, keylist, namemapping, starttime, endtime, time_column) {
  db = {
      'type': 'cassandra',
      'ip': ip,
      'port': port,
      'username': username,
      'password': password,
      'db': dbname,
      'sql': cassandra_gen_sql(dbname, tblname, keylist, starttime, endtime, time_column),
      'namemapping': namemapping
  };

  return db;
}