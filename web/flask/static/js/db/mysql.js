function mysql_gen_sql(tbl_name, key_names, starttime, endtime, time_column) {
    sql = 'SELECT ';
    for (i in key_names) {
        key_name = key_names[i]
        sql += key_name + ', ';
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ' FROM ';
    sql += tbl_name;
    
    if (time_column != "None" && starttime != "" && endtime != "") {
        // example: select * from table where time_column between 'starttime' and 'endtime';
        sql += ` WHERE ${time_column} BETWEEN '${starttime}' AND '${endtime}';`;
        return sql;
    }
    sql += ';';
    return sql;
}

function gen_db_info_mysql(ip, port, username, password, dbname, tblname, keylist, namemapping, starttime, endtime, time_column) {
  db = {
      'type': 'mysql',
      'ip': ip,
      'port': port,
      'username': username,
      'password': password,
      'db': dbname,
      'sql': mysql_gen_sql(tblname, keylist, starttime, endtime, time_column),
      'namemapping': namemapping
  };

  return db;
}