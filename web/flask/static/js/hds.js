function gen_hds_sql(table_name, key_info) {
    sql = 'CREATE TABLE ' + table_name + ' (';

    var primary_key_cnt = 0;
    for (k in key_info) {
        if (key_info[k]['is_primary']) {
            sql += k + ' ' + key_info[k]['type'] + ' not null, ';
            primary_key_cnt++;
        }
        else {
            sql += k + ' ' + key_info[k]['type'] + ', ';
        }
    }

    if (primary_key_cnt != 0) {
        sql += 'CONSTRAINT pk PRIMARY KEY (';
        for (k in key_info) {
            if (key_info[k]['is_primary']) {
                sql += key_info[k]['key'] + ', ';
            }
        }
    }
    else {
        sql += 'AUTOTIMESTAMP__ TIMESTAMP , ';
        sql += 'CONSTRAINT pk PRIMARY KEY (AUTOTIMESTAMP__, ';
    }

    sql = sql.substring(0, sql.length-2);
    sql += '));';
    return sql;
}

function gen_hds_columns(key_info) {
    col = []
    for (k in key_info) {
        col.push(k);
    }
    return col;
}