function gen_db_info_none(ip, port, username, password, dbname, tblname, keylist, namemapping, starttime, endtime, columnForTimeQuery) {
  db = {
      'type': 'none',
      'ip': '',
      'port': '',
      'username': '',
      'password': '',
      'db': '',
      'sql': '',
      'namemapping': {},
      'columnForTimeQuery': ''
  };

  return db;
}