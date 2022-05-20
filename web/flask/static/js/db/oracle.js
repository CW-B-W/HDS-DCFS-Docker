function oracle_gen_sql(db_name, tbl_name, key_names, starttime, endtime, time_column) {
    sql = 'SELECT ';
    for (i in key_names) {
        key_name = key_names[i]
        sql += key_name + ', ';
    }
    sql = sql.substring(0, sql.length - 2);
    sql += ' FROM ';
    sql += db_name;
    sql += '.'
    sql += tbl_name;
   if (time_column != "None" && starttime != "" && endtime != "") {
        // remove T
        starttime = starttime.replace("T", " ");
        endtime = endtime.replace("T", " ");
        // example: SELECT * FROM table WHERE time_column BETWEEN TO_DATE ('starttime', 'YYYY-MM-DD HH24:MI:SS') AND TO_DATE('endtime', 'YYYY-MM-DD HH24:MI:SS');
        sql += ' WHERE ';
        sql += time_column;
        sql += ' BETWEEN TO_DATE ( \'';
        sql += starttime;
        sql += '\', \'YYYY-MM-DD HH24:MI:SS\') AND TO_DATE(\'';
        sql += endtime;
        sql += '\', \'YYYY-MM-DD HH24:MI:SS\') ';
        return sql;
    }
    // sql += ';'; // DO NOT add ';' for OracleDB
    return sql;
}

function gen_db_info_oracle(ip, port, username, password, dbname, tblname, keylist, namemapping, starttime, endtime, time_column) {
  db = {
      'type': 'oracle',
      'ip': ip,
      'port': port,
      'username': username,
      'password': password,
      'db': dbname,
      'sql': oracle_gen_sql(db_name, tblname, keylist, starttime, endtime, time_column),
      'namemapping': namemapping
  };

  return db;
}