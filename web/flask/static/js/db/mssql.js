function mssql_gen_sql(tbl_name, key_names, starttime, endtime, columnForTimeQuery) {
    tbl_name = '[' + tbl_name.substring(0, tbl_name.indexOf('.')) + '].[' + tbl_name.substring(tbl_name.indexOf('.')+1) + ']';
    sql = 'SELECT ';
    for (i in key_names) {
        key_name = key_names[i]
        sql += key_name + ', ';
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ' FROM ';
    sql += tbl_name;

    if (columnForTimeQuery != "None" && starttime != "" && endtime != "") {
        // example: SELECT * FROM timeTest WHERE columnForTimeQuery BETWEEN CONVERT(datetime,'starttime') AND CONVERT(datetime,'endtime')
        sql += ' WHERE ';
        sql += columnForTimeQuery;
        sql += ' BETWEEN CONVERT(datetime,\'';
        sql += starttime;
        sql += '\') AND CONVERT(datetime,\'';
        sql += endtime;
        sql += '\');';
        return sql;
    } else {
        sql += ';';
        return sql;
    }
}

function gen_db_info_mssql(ip, port, username, password, dbname, tblname, keylist, namemapping, starttime, endtime, columnForTimeQuery) {
  db = {
      'type': 'mssql',
      'ip': ip,
      'port': port,
      'username': username,
      'password': password,
      'db': dbname,
      'sql': mssql_gen_sql(tblname, keylist, starttime, endtime, columnForTimeQuery),
      'namemapping': namemapping,
      'starttime': starttime,
      'endtime': endtime
  };

  return db;
}