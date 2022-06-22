function hbase_gen_filter(key_names) {
    return key_names
}

function gen_db_info_hbase(ip, port, username, password, dbname, tblname, keylist, namemapping, starttime, endtime, time_column) {
    db = {
        'type': 'hbase',
        'ip': ip,
        'port': port,
        'username': username,
        'password': password,
        'db': dbname,
        'tblname': tblname,
        'sql': hbase_gen_filter(keylist),
        'namemapping': namemapping,
        'starttime': starttime,
        'endtime': endtime,
        'time_column': time_column
    };

    return db;
}