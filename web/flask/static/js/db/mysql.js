function mysql_gen_sql(tbl_name, key_names, starttime, endtime, columnForTimeQuery) {
    sql = 'SELECT ';
    for (i in key_names) {
        key_name = key_names[i]
        sql += key_name + ', ';
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ' FROM ';
    sql += tbl_name;
    
    if (columnForTimeQuery != "None" && starttime != "" && endtime != "") {
        // example: select * from table where columnForTimeQuery between 'starttime' and 'endtime';
        console.log(columnForTimeQuery)
        console.log(starttime)
        console.log(endtime)
        sql += ' WHERE ';
        sql += columnForTimeQuery;
        sql += ' BETWEEN \'';
        sql += starttime;
        sql += '\' AND \'';
        sql += endtime;
        sql += '\';';
        return sql;
    } else {
        sql += ';';
        return sql;
    }
}

function gen_db_info_mysql(ip, port, username, password, dbname, tblname, keylist, namemapping, starttime, endtime, columnForTimeQuery) {
  db = {
      'type': 'mysql',
      'ip': ip,
      'port': port,
      'username': username,
      'password': password,
      'db': dbname,
      'sql': mysql_gen_sql(tblname, keylist, starttime, endtime, columnForTimeQuery),
      'namemapping': namemapping
  };

  return db;
}