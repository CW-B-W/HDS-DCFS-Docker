function gen_hds_sql(table_name, key_info) {
    key_info = sort_key_info(key_info);
    sql = 'CREATE TABLE ' + table_name + ' (';
    for (k in key_info) {
        if (key_info[k]['is_primary']) {
            sql += k + ' ' + key_info[k]['type'] + ' PRIMARY KEY, ';
            break;
        }
    }
    for (k in key_info) {
        if (!key_info[k]['is_primary']) {
            sql += k + ' ' + key_info[k]['type'] + ', ';
        }
    }
    sql = sql.substring(0, sql.length-2);
    sql += ');';
    return sql;
}

function gen_hds_columns(key_info) {
    key_info = sort_key_info(key_info);
    col = []
    for (k in key_info) {
        if (key_info[k]['is_primary']) {
            col.push(k);
            break;
        }
    }
    for (k in key_info) {
        if (!key_info[k]['is_primary']) {
            col.push(k);
        }
    }
    return col;
}