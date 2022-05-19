function cassandra_gen_sql(db_name, tbl_name, key_names, starttime, endtime, columnForTimeQuery) {
    sql = 'SELECT ';
    for (i in key_names) {
        key_name = key_names[i]
        sql += key_name + ', ';
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ' FROM ';
    sql += db_name + '.' + tbl_name;
    if (columnForTimeQuery != "None" && starttime != "" && endtime != "") {
       // example: SELECT * FROM table WHERE columnForTimeQuery >= 'starttime' AND  DateTest <= 'endtime';
        sql += ' WHERE ';
        sql += columnForTimeQuery;
        sql += ' >= \'';
        sql += starttime;
        sql += '\'AND ';
        sql += columnForTimeQuery;
        sql += ' <=\'';
        sql += endtime;
        sql += '\';';
        return sql;
    } 
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
      'sql': cassandra_gen_sql(dbname, tblname, keylist, starttime, endtime, columnForTimeQuery),
      'namemapping': namemapping
  };

  return db;
}