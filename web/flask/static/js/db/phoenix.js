function phoenix_gen_sql(tbl_name, key_names, starttime, endtime, columnForTimeQuery) {
    sql = 'SELECT ';
    for (i in key_names) {
        key_name = key_names[i]
        sql += key_name + ', ';
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ' FROM ';
    sql += tbl_name;
    if (columnForTimeQuery != "None" && starttime != "" && endtime != "") {
        //example: SELECT * FROM table WHERE columnForTimeQuery>= 'starttime' AND columnForTimeQuery <= 'endtime'
        sql += ' WHERE ';
        sql += columnForTimeQuery;
        sql += ' >= \'';
        sql += starttime;
        sql += '\'AND ';
        sql += columnForTimeQuery;
        sql += ' <=\'';
        sql += endtime;
        sql += '\'';
        return sql;
     }
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
      'sql': phoenix_gen_sql(tblname, keylist, starttime, endtime, columnForTimeQuery),
      'namemapping': namemapping,
      'starttime': starttime,
      'endtime': endtime
  };

  return db;
}