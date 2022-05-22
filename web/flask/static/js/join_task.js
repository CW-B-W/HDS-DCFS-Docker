function gen_task_info(
    _db1_type, db1_ip, db1_port, db1_username, db1_password, db1_dbname, db1_tblname, db1_keylist, db1_namemapping, db1_starttime, db1_endtime, db1_time_column,
    _db2_type, db2_ip, db2_port, db2_username, db2_password, db2_dbname, db2_tblname, db2_keylist, db2_namemapping, db2_starttime, db2_endtime, db2_time_column,
    join_sql,
    hds_sql, hds_table, hds_columns
){
    const db1_type = _db1_type.toLowerCase();
    const db2_type = _db2_type.toLowerCase();

    task_info = {
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
    task_info['db'].push(eval(`gen_db_info_${db1_type}`)(db1_ip, db1_port, db1_username, db1_password, db1_dbname, db1_tblname, db1_keylist, db1_namemapping, db1_starttime, db1_endtime, db1_time_column));
    task_info['db'].push(eval(`gen_db_info_${db2_type}`)(db2_ip, db2_port, db2_username, db2_password, db2_dbname, db2_tblname, db2_keylist, db2_namemapping, db2_starttime, db2_endtime, db2_time_column));

    return task_info;
}
