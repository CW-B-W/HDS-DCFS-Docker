function phoenix_gen_sql(tbl_name, key_names, starttime, endtime, time_column) {
    sql = 'SELECT ';
    for (i in key_names) {
        key_name = key_names[i]
        sql += key_name + ', ';
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ' FROM ';
    sql += tbl_name;
    if (time_column != "None" && starttime != "" && endtime != "") {
        //example: SELECT * FROM table WHERE time_column>= 'starttime' AND time_column <= 'endtime'
        sql += ' WHERE ';
        sql += time_column;
        sql += ' >= \'';
        sql += starttime;
        sql += '\'AND ';
        sql += time_column;
        sql += ' <=\'';
        sql += endtime;
        sql += '\'';
        return sql;
     }
    //sql += ';'; ==> phoenix dont need ";"
    return sql;
}

function gen_db_info_phoenix(ip, port, username, password, dbname, tblname, keylist, namemapping, starttime, endtime, time_column) {
  db = {
      'type': 'phoenix',
      'ip': ip,
      'port': port,
      'username': username,
      'password': password,
      'db': dbname,
      'sql': phoenix_gen_sql(tblname, keylist, starttime, endtime, time_column),
      'namemapping': namemapping,
      'starttime': starttime,
      'endtime': endtime
  };

  return db;
}