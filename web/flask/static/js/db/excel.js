function excel_gen_sql(tbl_name, key_names) {
    sql = 'SELECT ';
    for (i in key_names) {
        key_name = key_names[i]
        sql += key_name + ', ';
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ' FROM ';
    sql += 'my_data';
    sql += ';';
    return sql;
}

function gen_db_info_excel(ip, port, username, password, dbname, tblname, keylist, namemapping) {
  db = {
      'type': 'excel',
      'ip': ip,
      'port': port,
      'username': username,
      'password': password,
      'db': dbname,
      'tblname': tblname,
      'sql': excel_gen_sql(tblname, keylist),
      'namemapping': namemapping
  };

  return db;
}