function gen_db_info_none(ip, port, username, password, dbname, tblname, keylist, namemapping, starttime, endtime, time_column) {
  db = {
      'type': 'none',
      'ip': '',
      'port': '',
      'username': '',
      'password': '',
      'db': '',
      'sql': '',
      'namemapping': {}
  };

  return db;
}