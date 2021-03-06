function mongodb_gen_filter(key_names) {
    field_filter = {
        '_id': 0
    };
    for (i in key_names) {
        key_name = key_names[i];
        if (key_name == '_id')
            continue;
        field_filter[key_name] = 1
    }
    return field_filter;
}

function gen_db_info_mongodb(ip, port, username, password, dbname, tblname, keylist, namemapping, starttime, endtime, time_column) {
    db = {
        'type': 'mongodb',
        'ip': ip,
        'port': port,
        'username': username,
        'password': password,
        'db': dbname,
        'collection': tblname,
        'sql': mongodb_gen_filter(keylist),
        'namemapping': namemapping,
        'starttime': starttime,
        'endtime': endtime,
        'time_column': time_column
    };

    return db;
}