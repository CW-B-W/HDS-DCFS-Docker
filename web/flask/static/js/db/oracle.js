function oracle_gen_sql(tbl_name, key_names) {
    sql = 'SELECT ';
    for (i in key_names) {
        key_name = key_names[i]
        sql += key_name + ', ';
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ' FROM ';
    sql += tbl_name;
    // sql += ';'; // DO NOT add ';' for OracleDB
    return sql;
}

function gen_db_info_oracle(ip, port, username, password, dbname, tblname, keylist) {
  db = {
      'type': 'oracle',
      'ip': ip,
      'port': port,
      'username': username,
      'password': password,
      'db': dbname,
      'sql': oracle_gen_sql(tblname, keylist)
  };

  return db;
}