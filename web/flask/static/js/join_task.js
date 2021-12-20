function gen_task_info(
    task_id,
    _db1_type, db1_ip, db1_port, db1_username, db1_password, db1_dbname, db1_tblname, db1_keylist, db1_namemapping,
    _db2_type, db2_ip, db2_port, db2_username, db2_password, db2_dbname, db2_tblname, db2_keylist, db2_namemapping,
    join_sql,
    hds_sql, hds_table, hds_columns
){
    const db1_type = _db1_type.toLowerCase();
    const db2_type = _db2_type.toLowerCase();

    task_info = {
        'task_id': task_id,
        'db': [
        ],
        'join_sql': join_sql,
        'hds': {
            'sql': hds_sql,        // the sql to create table
            'table': hds_table,
            'columns': hds_columns // the column names in table (ordered)
        }
    };

    /* Use reflection. e.g. if db1_type is 'mongodb', eval(...)(...) will call gen_db_info_mongodb(...) */
    task_info['db'].push(eval(`gen_db_info_${db1_type}`)(db1_ip, db1_port, db1_username, db1_password, db1_dbname, db1_tblname, db1_keylist, db1_namemapping));
    task_info['db'].push(eval(`gen_db_info_${db2_type}`)(db2_ip, db2_port, db2_username, db2_password, db2_dbname, db2_tblname, db2_keylist, db2_namemapping));

    return task_info;
}

function gen_task_info_single(
    task_id,
    _db1_type, db1_ip, db1_port, db1_username, db1_password, db1_dbname, db1_tblname, db1_keylist, db1_namemapping,
    hds_sql, hds_table, hds_columns
){
    const db1_type = _db1_type.toLowerCase();

    task_info = {
        'task_id': task_id,
        'db': [
        ],
        'hds': {
            'sql': hds_sql,        // the sql to create table
            'table': hds_table,
            'columns': hds_columns // the column names in table (ordered)
        }
    };

    /* Use reflection. e.g. if db1_type is 'mongodb', eval(...)(...) will call gen_db_info_mongodb(...) */
    task_info['db'].push(eval(`gen_db_info_${db1_type}`)(db1_ip, db1_port, db1_username, db1_password, db1_dbname, db1_tblname, db1_keylist, db1_namemapping));

    return task_info;
}