// src: https://cythilya.github.io/2017/03/12/uuid/
function _uuid() {
    var d = Date.now();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function sort_key_info(key_info) {
    primary_key = '';
    for (i in key_info) {
        if (key_info[i]['is_primary']) {
            primary_key = i;
            break;
        }
    }
    key_list = Object.keys(key_info).sort();
    key_list.splice(key_list.indexOf(primary_key), 1);
    key_list.unshift(primary_key);

    const ordered = key_list.reduce(
        (obj, key) => { 
            obj[key] = key_info[key]; 
            return obj;
        }, 
        {}
    );
    return ordered;
}

function sql_gen_join(db1_key_names, db2_key_names) {
    const intersections = db1_key_names.filter(function(n) {
        return db2_key_names.indexOf(n) !== -1;
    });
    const diff0 = db1_key_names.filter(function(n) {
        return db2_key_names.indexOf(n) === -1;
    });
    const diff1 = db2_key_names.filter(function(n) {
        return db1_key_names.indexOf(n) === -1;
    });
    if (intersections.length == 0) {
        throw "No intersection between the two groups";
    }

    /* df0 is the table of db1 */
    /* df1 is the table of db2 */
    sql = 'SELECT ';
    for (i in intersections) {
        common_key = intersections[i];
        sql += 'COALESCE(df0.' + common_key + ', df1.' + common_key + ') as ' + common_key + ', ';
    }
    for (i in diff0) {
        key = diff0[i];
        sql += 'df0.' + key + ' as ' + key + ', '
    }
    for (i in diff1) {
        key = diff1[i];
        sql += 'df1.' + key + ' as ' + key + ', '
    }
    sql = sql.substring(0, sql.lastIndexOf(', '));
    sql += ' FROM df0 LEFT JOIN df1 ON ';
    for (i in intersections) {
        common_key = intersections[i];
        sql += 'df0.' + common_key + '=df1.' + common_key + ' AND ';
    }
    sql = sql.substring(0, sql.length-4);
    sql += ';';

    /*
    SELECT 
        COALESCE(df0.ID, df1.ID) as ID, 
        df0.Chinese as Chinese, 
        df0.Math as Math, 
        df1.MartialArts as MartialArts, 
        df1.Swim as Swim 
        FROM df0 
        LEFT JOIN df1 
        ON df0.ID=df1.ID
    */
   return sql;
}