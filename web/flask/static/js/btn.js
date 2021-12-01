$(document).ready(function() {
    /*NEW TASK*/
    $("#db1_list").change(function() {
        sel_idx = $(this).val();
        if (sel_idx == "MySQL") {
            $('#mysql_server').val("192.168.103.52:3306");
            $('#mysql_username').val("brad");
            $('#mysql_password').val("00000000");
            $("#conn_mysql").text("Connect MySQL")
        }else if(sel_idx == "MsSQL"){
            $('#mysql_server').val("192.168.103.52:1433");
            $('#mysql_username').val("SA");
            $('#mysql_password').val("00000000Xx");
            $("#conn_mysql").text("Connect MsSQL")
        }else if(sel_idx == "Oracle"){
            $('#mysql_server').val("192.168.103.60:1521");
            $('#mysql_username').val("brad");
            $('#mysql_password').val("00000000");
            $("#conn_mysql").text("Connect Oracle")
        }else if(sel_idx == "MongoDB"){
            $('#mysql_server').val("192.168.103.52:27017");
            $('#mysql_username').val("brad");
            $('#mysql_password').val("00000000");
            $("#conn_mysql").text("Connect MongoDB")
        }else if(sel_idx == "Cassandra"){
            $('#mysql_server').val("192.168.103.125:9042");
            $('#mysql_username').val("brad");
            $('#mysql_password').val("00000000");
            $("#conn_mysql").text("Connect Cassandra")
        }
        else if(sel_idx == "Elasticsearch"){
            $('#mysql_server').val("192.168.103.125:9200");
            $('#mysql_username').val("brad");
            $('#mysql_password').val("00000000");
            $("#conn_mysql").text("Connect Elasticsearch")
        }
    });
    $("#db2_list").change(function() {
        sel_idx = $(this).val();
        if (sel_idx == "MySQL") {
            $('#mongodb_server').val("192.168.103.52:3306");
            $('#mongodb_username').val("brad");
            $('#mongodb_password').val("00000000");
            $("#conn_mongodb").text("Connect MySQL")
        }else if(sel_idx == "MsSQL"){
            $('#mongodb_server').val("192.168.103.52:1433");
            $('#mongodb_username').val("SA");
            $('#mongodb_password').val("00000000Xx");
            $("#conn_mongodb").text("Connect MsSQL")
        }else if(sel_idx == "Oracle"){
            $('#mongodb_server').val("192.168.103.60:1521");
            $('#mongodb_username').val("brad");
            $('#mongodb_password').val("00000000");
            $("#conn_mongodb").text("Connect Oracle")
        }else if(sel_idx == "MongoDB"){
            $('#mongodb_server').val("192.168.103.52:27017");
            $('#mongodb_username').val("brad");
            $('#mongodb_password').val("00000000");
            $("#conn_mongodb").text("Connect MongoDB")
        }else if(sel_idx == "Cassandra"){
            $('#mongodb_server').val("192.168.103.125:9042");
            $('#mongodb_username').val("brad");
            $('#mongodb_password').val("00000000");
            $("#conn_mongodb").text("Connect Cassandra")
        }
        else if(sel_idx == "Elasticsearch"){
            $('#mongodb_server').val("192.168.103.125:9200");
            $('#mongodb_username').val("brad");
            $('#mongodb_password').val("00000000");
            $("#conn_mongodb").text("Connect Elasticsearch")
        }
    });
    
    /* ==================== MySQL & MsSQL & Oracle & cassandra ==================== */
    $("#conn_mysql").click(function() {
        if(  ($("#db1_list").val() != "MongoDB") ){
            database = $("#db1_list").val().toLowerCase();
            username = $('#mysql_username').val();
            password = $('#mysql_password').val();
            ip_port = $('#mysql_server').val().split(':');
            ip = ip_port[0]
            port = ip_port[1]
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;
            $.ajax({
                "type": "GET",
                "dataType": "json",
                "contentType": "application/json",
                "url": 'http://192.168.103.62:5000/' +database+ '/listdbs?' + args,
                "timeout": 30000,
                success: function(result) {
                    // clear original options
                    children = $('#mysql_db_list').children();
                    for (i = 1; i < children.length; ++i) {
                        children[i].remove();
                    }
                    $('#mysql_db_list')[0].selectedIndex = 0;

                    db_list = result['db_list'];
                    for (key in db_list) {
                        opt_idx = parseInt(key) + 1
                        $('#mysql_db_list').append('<option value="' + opt_idx + '">' + db_list[key] + '</option>');

                    }

                    $("#conn_mysql_status").text("Connect success");
                },
                error: function(jqXHR, JQueryXHR, textStatus) {
                    $("#conn_mysql_status").text("Connect failed");
                }
            });
            /* ==================== MySQL & MsSQL & Oracle & cassandra ==================== */
        }else{
            /* =================== MongoDB =================== */
            $.ajax({
                "type": "GET",
                "dataType": "json",
                "contentType": "application/json",
                "url": 'http://192.168.103.62:5000/mongo/listdbs',
                "timeout": 30000,
                success: function(result) {
                    // clear original options
                    children = $('#mysql_db_list').children();
                    for (i = 1; i < children.length; ++i) {
                        children[i].remove();
                    }
                    $('#mysql_db_list')[0].selectedIndex = 0;

                    db_list = result['db_list'];
                    for (key in db_list) {
                        opt_idx = parseInt(key) + 1
                        $('#mysql_db_list').append('<option value="' + opt_idx + '">' + db_list[key] + '</option>');

                    }

                    $("#conn_mysql_status").text("Connect MongoDB success");
                },
                error: function(jqXHR, JQueryXHR, textStatus) {
                    $("#conn_mysql_status").text("Connect MongoDB failed");
                }
            });
            /* =================== MongoDB =================== */
        }
        
    });
    $("#mysql_db_list").change(function() {
        /* ==================== MySQL & MsSQL & Oracle & cassandra ==================== */
        if(  ($("#db1_list").val() != "MongoDB") ){
            database = $("#db1_list").val().toLowerCase();
            username = $('#mysql_username').val();
            password = $('#mysql_password').val();
            ip_port = $('#mysql_server').val().split(':');
            ip = ip_port[0]
            port = ip_port[1]
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;

            sel_idx = $(this)[0].selectedIndex;
            if (sel_idx != 0) {
                db_name = $(this).children().eq(sel_idx).text();
                args += '&db_name=' + db_name;
                $.ajax({
                    "type": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "url": 'http://192.168.103.62:5000/' +database+ '/listtables?' + args,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#mysql_table_list').children();
                        for (i = 1; i < children.length; ++i) {
                            children[i].remove();
                        }
                        $('#mysql_table_list')[0].selectedIndex = 0;

                        table_list = result['table_list'];
                        for (key in table_list) {
                            opt_idx = parseInt(key) + 1
                            $('#mysql_table_list').append('<option value="' + opt_idx + '">' + table_list[key] + '</option>');

                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $("#conn_mysql_status").text("Connect failed");
                    }
                });
            } else {
                children = $('#mysql_table_list').children();
                for (i = 1; i < children.length; ++i) {
                    children[i].remove();
                }
                $('#mysql_table_list')[0].selectedIndex = 0;
            }
            /* ==================== MySQL & MsSQL & Oracle & cassandra==================== */
        }else{
            /* =================== MongoDB =================== */
            sel_idx = $(this)[0].selectedIndex;
            if (sel_idx != 0) {
                db_name = $(this).children().eq(sel_idx).text();
                $.ajax({
                    "type": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "url": 'http://192.168.103.62:5000/mongo/listcollections?db_name=' + db_name,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#mysql_table_list').children();
                        for (i = 1; i < children.length; ++i) {
                            children[i].remove();
                        }
                        $('#mysql_table_list')[0].selectedIndex = 0;
    
                        collection_list = result['collection_list'];
                        for (key in collection_list) {
                            opt_idx = parseInt(key) + 1
                            $('#mysql_table_list').append('<option value="' + opt_idx + '">' + collection_list[key] + '</option>');
    
                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $("#conn_mongodb_status").text("Connect MongoDB failed");
                    }
                });
            } else {
                children = $('#mysql_table_list').children();
                for (i = 1; i < children.length; ++i) {
                    children[i].remove();
                }
                $('#mysql_table_list')[0].selectedIndex = 0;
            }
        }
        /* =================== MongoDB =================== */
    });
    $("#mysql_table_list").change(function() {
        /* ==================== MySQL & MsSQL & Oracle & cassandra==================== */
        if(  ($("#db1_list").val() != "MongoDB") ){
            database = $("#db1_list").val().toLowerCase();
            username = $('#mysql_username').val();
            password = $('#mysql_password').val();
            ip_port = $('#mysql_server').val().split(':');
            ip = ip_port[0]
            port = ip_port[1]
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;

            db_sel_idx = $("#mysql_db_list")[0].selectedIndex;
            tbl_sel_idx = $(this)[0].selectedIndex;
            if (tbl_sel_idx != 0) {
                db_name = $("#mysql_db_list").children().eq(db_sel_idx).text();
                tbl_name = $(this).children().eq(tbl_sel_idx).text();
                args += '&db_name=' + db_name;
                args += '&table_name=' + tbl_name;
                $.ajax({
                    "type": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "url": 'http://192.168.103.62:5000/' +database+ '/listkeys?' + args,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#mysql_key_list').children();
                        for (i = 0; i < children.length; ++i) {
                            children[i].remove();
                        }

                        key_list = result['key_list'];
                        for (key in key_list) {
                            opt_idx = parseInt(key) + 1
                            $('#mysql_key_list').append('<option value="' + opt_idx + '">' + key_list[key] + '</option>');
                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $("#conn_mysql_status").text("Connect failed");
                    }
                });
            } else {
                children = $('#mysql_key_list').children();
                for (i = 0; i < children.length; ++i) {
                    children[i].remove();
                }
            }
        /* ==================== MySQL & MsSQL & Oracle & cassandra==================== */
        }else{
            /* =================== MongoDB =================== */
            db_sel_idx = $("#mysql_db_list")[0].selectedIndex;
            tbl_sel_idx = $(this)[0].selectedIndex;
            if (tbl_sel_idx != 0) {
                db_name = $("#mysql_db_list").children().eq(db_sel_idx).text();
                tbl_name = $(this).children().eq(tbl_sel_idx).text();
                $.ajax({
                    "type": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "url": 'http://192.168.103.62:5000/mongo/listkeys?db_name=' + db_name + '&collection_name=' + tbl_name,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#mysql_key_list').children();
                        for (i = 0; i < children.length; ++i) {
                            children[i].remove();
                        }

                        key_list = result['key_list'];
                        key_list.splice(key_list.indexOf('_id'), 1);
                        for (key in key_list) {
                            opt_idx = parseInt(key) + 1
                            $('#mysql_key_list').append('<option value="' + opt_idx + '">' + key_list[key] + '</option>');
                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $("#conn_mysql_status").text("Connect MongoDB failed");
                    }
                });
            } else {
                children = $('#mysql_key_list').children();
                for (i = 0; i < children.length; ++i) {
                    children[i].remove();
                }
            }
            /* =================== MongoDB =================== */
        }
    });
    
    
    
    $("#conn_mongodb").click(function() {
        if(  ($("#db2_list").val() != "MongoDB") ){
            /* ==================== MySQL & MsSQL & Oracle & cassandra ==================== */
            database = $("#db2_list").val().toLowerCase();
            username = $('#mongodb_username').val();
            password = $('#mongodb_password').val();
            ip_port = $('#mongodb_server').val().split(':');
            ip = ip_port[0]
            port = ip_port[1]
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;
            $.ajax({
                "type": "GET",
                "dataType": "json",
                "contentType": "application/json",
                "url": 'http://192.168.103.62:5000/' +database+ '/listdbs?' + args,
                "timeout": 30000,
                success: function(result) {
                    // clear original options
                    children = $('#mongodb_db_list').children();
                    for (i = 1; i < children.length; ++i) {
                        children[i].remove();
                    }
                    $('#mongodb_db_list')[0].selectedIndex = 0;

                    db_list = result['db_list'];
                    for (key in db_list) {
                        opt_idx = parseInt(key) + 1
                        $('#mongodb_db_list').append('<option value="' + opt_idx + '">' + db_list[key] + '</option>');

                    }

                    $("#conn_mongodb_status").text("Connect success");
                },
                error: function(jqXHR, JQueryXHR, textStatus) {
                    $("#conn_mongodb_status").text("Connect failed");
                }
            });
            /* ==================== MySQL & MsSQL & Oracle & cassandra ==================== */
        }else{
            /* =================== MongoDB =================== */
            $.ajax({
                "type": "GET",
                "dataType": "json",
                "contentType": "application/json",
                "url": 'http://192.168.103.62:5000/mongo/listdbs',
                "timeout": 30000,
                success: function(result) {
                    // clear original options
                    children = $('#mongodb_db_list').children();
                    for (i = 1; i < children.length; ++i) {
                        children[i].remove();
                    }
                    $('#mongodb_db_list')[0].selectedIndex = 0;

                    db_list = result['db_list'];
                    for (key in db_list) {
                        opt_idx = parseInt(key) + 1
                        $('#mongodb_db_list').append('<option value="' + opt_idx + '">' + db_list[key] + '</option>');

                    }

                    $("#conn_mongodb_status").text("Connect MongoDB success");
                },
                error: function(jqXHR, JQueryXHR, textStatus) {
                    $("#conn_mongodb_status").text("Connect MongoDB failed");
                }
            });
            /* =================== MongoDB =================== */
        }
    });   
    $("#mongodb_db_list").change(function() {
        /* ==================== MySQL & MsSQL & Oracle & cassandra ==================== */
        if(  ($("#db2_list").val() != "MongoDB") ){
            database = $("#db2_list").val().toLowerCase();
            username = $('#mongodb_username').val();
            password = $('#mongodb_password').val();
            ip_port = $('#mongodb_server').val().split(':');
            ip = ip_port[0]
            port = ip_port[1]
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;

            sel_idx = $(this)[0].selectedIndex;
            if (sel_idx != 0) {
                db_name = $(this).children().eq(sel_idx).text();
                args += '&db_name=' + db_name;
                $.ajax({
                    "type": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "url": 'http://192.168.103.62:5000/' +database+ '/listtables?' + args,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#mongodb_collection_list').children();
                        for (i = 1; i < children.length; ++i) {
                            children[i].remove();
                        }
                        $('#mongodb_collection_list')[0].selectedIndex = 0;

                        table_list = result['table_list'];
                        for (key in table_list) {
                            opt_idx = parseInt(key) + 1
                            $('#mongodb_collection_list').append('<option value="' + opt_idx + '">' + table_list[key] + '</option>');

                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $("#conn_mongodb_status").text("Connect failed");
                    }
                });
            } else {
                children = $('#mongodb_collection_list').children();
                for (i = 1; i < children.length; ++i) {
                    children[i].remove();
                }
                $('#mongodb_collection_list')[0].selectedIndex = 0;
            }
            /* ==================== MySQL & MsSQL & Oracle & cassandra ==================== */
        }else{
            /* =================== MongoDB =================== */
            sel_idx = $(this)[0].selectedIndex;
            if (sel_idx != 0) {
                db_name = $(this).children().eq(sel_idx).text();
                $.ajax({
                    "type": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "url": 'http://192.168.103.62:5000/mongo/listcollections?db_name=' + db_name,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#mongodb_collection_list').children();
                        for (i = 1; i < children.length; ++i) {
                            children[i].remove();
                        }
                        $('#mongodb_collection_list')[0].selectedIndex = 0;

                        collection_list = result['collection_list'];
                        for (key in collection_list) {
                            opt_idx = parseInt(key) + 1
                            $('#mongodb_collection_list').append('<option value="' + opt_idx + '">' + collection_list[key] + '</option>');

                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $("#conn_mongodb_status").text("Connect MongoDB failed");
                    }
                });
            } else {
                children = $('#mongodb_collection_list').children();
                for (i = 1; i < children.length; ++i) {
                    children[i].remove();
                }
                $('#mongodb_collection_list')[0].selectedIndex = 0;
            }
        }
        /* =================== MongoDB =================== */
    });
    $("#mongodb_collection_list").change(function() {
        /* ==================== MySQL & MsSQL & Oracle & cassandra ==================== */
        if(  ($("#db2_list").val() != "MongoDB") ){
            database = $("#db2_list").val().toLowerCase();
            username = $('#mongodb_username').val();
            password = $('#mongodb_password').val();
            ip_port = $('#mongodb_server').val().split(':');
            ip = ip_port[0]
            port = ip_port[1]
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;

            db_sel_idx = $("#mongodb_db_list")[0].selectedIndex;
            tbl_sel_idx = $(this)[0].selectedIndex;
            if (tbl_sel_idx != 0) {
                db_name = $("#mongodb_db_list").children().eq(db_sel_idx).text();
                tbl_name = $(this).children().eq(tbl_sel_idx).text();
                args += '&db_name=' + db_name;
                args += '&table_name=' + tbl_name;
                $.ajax({
                    "type": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "url": 'http://192.168.103.62:5000/' +database+ '/listkeys?' + args,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#mongodb_key_list').children();
                        for (i = 0; i < children.length; ++i) {
                            children[i].remove();
                        }

                        key_list = result['key_list'];
                        for (key in key_list) {
                            opt_idx = parseInt(key) + 1
                            $('#mongodb_key_list').append('<option value="' + opt_idx + '">' + key_list[key] + '</option>');
                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $("#conn_mongodb_status").text("Connect failed");
                    }
                });
            } else {
                children = $('#mongodb_key_list').children();
                for (i = 0; i < children.length; ++i) {
                    children[i].remove();
                }
            }
            /* ==================== MySQL & MsSQL & Oracle & cassandra ==================== */
        }else{
            /* =================== MongoDB =================== */
            db_sel_idx = $("#mongodb_db_list")[0].selectedIndex;
            tbl_sel_idx = $(this)[0].selectedIndex;
            if (tbl_sel_idx != 0) {
                db_name = $("#mongodb_db_list").children().eq(db_sel_idx).text();
                tbl_name = $(this).children().eq(tbl_sel_idx).text();
                $.ajax({
                    "type": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "url": 'http://192.168.103.62:5000/mongo/listkeys?db_name=' + db_name + '&collection_name=' + tbl_name,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#mongodb_key_list').children();
                        for (i = 0; i < children.length; ++i) {
                            children[i].remove();
                        }

                        key_list = result['key_list'];
                        key_list.splice(key_list.indexOf('_id'), 1);
                        for (key in key_list) {
                            opt_idx = parseInt(key) + 1
                            $('#mongodb_key_list').append('<option value="' + opt_idx + '">' + key_list[key] + '</option>');
                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $("#conn_mongodb_status").text("Connect MongoDB failed");
                    }
                });
            } else {
                children = $('#mongodb_key_list').children();
                for (i = 0; i < children.length; ++i) {
                    children[i].remove();
                }
            }
        }
        /* =================== MongoDB =================== */
    });


    /* =================== GenTask =================== */
    function mysql_gen_sql(tbl_name, key_names, isOracle) {
        sql = 'SELECT ';
        for (i in key_names) {
            key_name = key_names[i]
            sql += key_name + ', ';
        }
        sql = sql.substring(0, sql.length - 2);
        sql += ' FROM ';
        sql += tbl_name;
        if(isOracle==0){
          sql += ';';
        }
        return sql;
    }

    function mongodb_gen_filter(key_names) {
        field_filter = {
            '_id': 0
        };
        for (i in key_names) {
            key_name = key_names[i];
            field_filter[key_name] = 1
        }
        return field_filter;
    }

    function sql_gen_join(mysql_key_names, mongodb_key_names) {
        const intersections = mysql_key_names.filter(function(n) {
            return mongodb_key_names.indexOf(n) !== -1;
        });
        const diff0 = mysql_key_names.filter(function(n) {
            return mongodb_key_names.indexOf(n) === -1;
        });
        const diff1 = mongodb_key_names.filter(function(n) {
            return mysql_key_names.indexOf(n) === -1;
        });
        if (intersections.length == 0) {
            throw "No intersection between the two groups";
        }

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

    function gen_task_info( //mongo + others, mongo only can put on right side.
            task_id,
            mysql_username, mysql_password, mysql_ip, mysql_port,
            mysql_db_name, mysql_sql,
            mongodb_username, mongodb_password, mongodb_ip, mongodb_port, 
            mongodb_db_name, mongodb_collection_name, mongodb_filter,
            join_sql,
            hds_sql, hds_table, hds_columns
    ){
        task_info = {
            'task_id': task_id,
            'db': [
                {
                    'type': $("#db1_list").val().toLowerCase(),
                    'username': mysql_username,
                    'password': mysql_password,
                    'ip': mysql_ip,
                    'port': mysql_port,
                    'db': mysql_db_name,
                    'sql': mysql_sql
                },
                {
                    'type': 'mongodb',
                    'username': mongodb_username,
                    'password': mongodb_password,
                    'ip': mongodb_ip,
                    'port': mongodb_port,
                    'db': mongodb_db_name,
                    'collection': mongodb_collection_name,
                    'filter': mongodb_filter
                }
            ],
            'join_sql': join_sql,
            'hds': {
                'sql': hds_sql,        // the sql to create table
                'table': hds_table,
                'columns': hds_columns // the column names in table (ordered)
            }
        };

        return task_info;
    }
    function gen_task_info_2(
        task_id,
        mysql_username, mysql_password, mysql_ip, mysql_port,
        mysql_db_name, mysql_sql,
        mongodb_username, mongodb_password, mongodb_ip, mongodb_port, 
        mongodb_db_name, mysql_sql_2,
        join_sql,
        hds_sql, hds_table, hds_columns
    ){
        task_info = {
            'task_id': task_id,
            'db': [
                {
                    'type': $('#db1_list').val().toLowerCase(),
                    'username': mysql_username,
                    'password': mysql_password,
                    'ip': mysql_ip,
                    'port': mysql_port,
                    'db': mysql_db_name,
                    'sql': mysql_sql
                },
                {
                    'type': $('#db2_list').val().toLowerCase(),
                    'username': mongodb_username,
                    'password': mongodb_password,
                    'ip': mongodb_ip,
                    'port': mongodb_port,
                    'db': mongodb_db_name,
                    'sql': mysql_sql_2
                }
            ],
            'join_sql': join_sql,
            'hds': {
                'sql': hds_sql,        // the sql to create table
                'table': hds_table,
                'columns': hds_columns // the column names in table (ordered)
            }
        };

        return task_info;
    }

    function import_gen_task_info(
        task_id,
        username, password, ip, port,
        db_name, sql,
        hds_sql, hds_table, hds_columns
    ){
        task_info = {
            'task_id': task_id,
            'db': [
                {
                    'type': $('#dblist').val().toLowerCase(),
                    'username': username,
                    'password': password,
                    'ip': ip,
                    'port': port,
                    'db': db_name,
                    'sql': sql
                },
            ],
            'hds': {
                'sql': hds_sql,        // the sql to create table
                'table': hds_table,
                'columns': hds_columns // the column names in table (ordered)
            }
        };

        return task_info;
    }
    function import_gen_task_info_2(
        task_id,
        username, password, ip, port,
        db_name, mongodb_collection_name,mongodb_filter,
        hds_sql, hds_table, hds_columns
    ){
        task_info = {
            'task_id': task_id,
            'db': [
                {
                    'type': 'mongodb',
                    'username': username,
                    'password': password,
                    'ip': ip,
                    'port': port,
                    'db': db_name,
                    'collection': mongodb_collection_name,
                    'filter': mongodb_filter
                },
            ],
            'hds': {
                'sql': hds_sql,        // the sql to create table
                'table': hds_table,
                'columns': hds_columns // the column names in table (ordered)
            }
        };

        return task_info;
    }

    function import_gen_col_opt_elems(mysql_key_names, mongodb_key_names) {
        key_names = mysql_key_names.concat(mongodb_key_names);
        key_names = key_names.filter(function(value, index, self) {
            return self.indexOf(value) === index;
        });

        for (i in key_names) {
            key_name = key_names[i];
            elem = $("#import_col_opt_template").clone().appendTo($("#import_col_opt_list")[0]);
            elem.removeAttr('id');
            elem.css('visibility', 'visible');
            elem.children().eq(0).children().eq(0).text(key_name);
            elem.children().eq(1).children().eq(0).attr('id', 'typeopt_'+key_name);
            elem.children().eq(3).children().eq(0).val(key_name);
            elem.children().eq(3).children().eq(1).text(key_name);
            elem.children().eq(3).children().eq(0).prop('checked', true);
        }
    }
    function gen_col_opt_elems(mysql_key_names, mongodb_key_names) {
        key_names = mysql_key_names.concat(mongodb_key_names);
        key_names = key_names.filter(function(value, index, self) {
            return self.indexOf(value) === index;
        });

        for (i in key_names) {
            key_name = key_names[i];
            elem = $("#col_opt_template").clone().appendTo($("#col_opt_list")[0]);
            elem.removeAttr('id');
            elem.css('visibility', 'visible');
            elem.children().eq(0).children().eq(0).text(key_name);
            elem.children().eq(1).children().eq(0).attr('id', 'typeopt_'+key_name);
            elem.children().eq(3).children().eq(0).val(key_name);
            elem.children().eq(3).children().eq(1).text(key_name);
            elem.children().eq(3).children().eq(0).prop('checked', true);
        }
    }

    $("#create_req").click(function() {
         /* =================== DB1 (LEFT) =================== */
        
        username_1 = $('#mysql_username').val();
        password_1 = $('#mysql_password').val();
        ip_port = $('#mysql_server').val().split(':');
        ip_1 = ip_port[0]
        port_1 = ip_port[1]
        db_name_1 = $('#mysql_db_list').children()
            .eq($('#mysql_db_list')[0].selectedIndex)
            .text();
        tbl_name_1 = $('#mysql_table_list').children()
            .eq($('#mysql_table_list')[0].selectedIndex)
            .text();
        mysql_key_sel_idx = $('#mysql_key_list').val();
        key_names_1 = [];
        for (i in mysql_key_sel_idx) {
            key_names_1.push(
                $('#mysql_key_list').children()
                .eq(mysql_key_sel_idx[i] - 1).text());
        }
        sql_1 = "";
        switch($("#db1_list").val()){
            case "MongoDB":
                mongodb_filter = mongodb_gen_filter(key_names_1);
                $('#mysql_genres').text(JSON.stringify(mongodb_filter));
                break;
            case "Oracle":
                isOracle=1;
                sql_1 = mysql_gen_sql(tbl_name_1, key_names_1,isOracle);
                $('#mysql_genres').text(sql_1);
                break;
            case "Cassandra":
                sql_1='SELECT * FROM '+db_name_1+'.'+tbl_name_1+'';
                $('#mysql_genres').text(sql_1);
                break;
            case "Elasticsearch":
                sql_1='SELECT * FROM '+tbl_name_1+'';
                $('#mysql_genres').text(sql_1);
                break;
            default:
                isOracle=0;
                sql_1 = mysql_gen_sql(tbl_name_1, key_names_1,isOracle);
                $('#mysql_genres').text(sql_1);
       }
        

        /* =================== DB2 (RIGHT) =================== */
        
        username_2 = $('#mongodb_username').val();
        password_2 = $('#mongodb_password').val();
        ip_port = $('#mongodb_server').val().split(':');
        ip_2 = ip_port[0]
        port_2 = ip_port[1]
        db_name_2 = $('#mongodb_db_list').children()
            .eq($('#mongodb_db_list')[0].selectedIndex)
            .text();
        tbl_name_2 = $('#mongodb_collection_list').children()
            .eq($('#mongodb_collection_list')[0].selectedIndex)
            .text();
        mysql_key_sel_idx = $('#mongodb_key_list').val();
        key_names_2 = [];
        for (i in mysql_key_sel_idx) {
            key_names_2.push(
                $('#mongodb_key_list').children()
                .eq(mysql_key_sel_idx[i] - 1).text());
        }
        sql_2 = "";
        switch($("#db2_list").val()){
            case "MongoDB":
                mongodb_filter = mongodb_gen_filter(key_names_2);
                $('#mongodb_genres').text(JSON.stringify(mongodb_filter));
                break;
            case "Oracle":
                isOracle=1;
                sql_2 = mysql_gen_sql(tbl_name_2, key_names_2,isOracle);
                $('#mongodb_genres').text(sql_2);
                break;
            case "Cassandra":
                sql_2='SELECT * FROM '+db_name_2+'.'+tbl_name_2+'';
                $('#mongodb_genres').text(sql_2);
                break;
            case "Elasticsearch":
                sql_2='SELECT * FROM '+tbl_name_2+'';
                $('#mongodb_genres').text(sql_2);
                break;
            default:
                isOracle=0;
                sql_2 = mysql_gen_sql(tbl_name_2, key_names_2,isOracle);
                $('#mongodb_genres').text(sql_2);
       }
       //mysql_key_names.map(txt => txt.toUpperCase())
    /* =================== generate join sql =================== */
        try {
            join_sql = sql_gen_join(key_names_1.map(txt => txt.toUpperCase()), key_names_2.map(txt => txt.toUpperCase()));
            $('#join_genres').text(join_sql);
        } catch (error) {
            $('#join_genres').text("");
            alert("Error generating JOIN SQL. Message = " + error);
            return;
        }

        gen_col_opt_elems(key_names_1.map(txt => txt.toUpperCase()), key_names_2.map(txt => txt.toUpperCase()));
    });

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

    function gen_hds_sql(key_info) {
        key_info = sort_key_info(key_info);
        table_name = $('#hds_table_name').val().replace(/ /g,"_");
        sql = 'CREATE TABLE IF NOT EXISTS ' + table_name + ' (';
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
    function import_gen_hds_sql(key_info) {
        key_info = sort_key_info(key_info);
        table_name = $('#import_hds_table_name').val().replace(/ /g,"_");
        sql = 'CREATE TABLE IF NOT EXISTS ' + table_name + ' (';
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
    /* =================== GenTask =================== */



    /* ==================== HDS  ====================== */
    $('#send_hds_req').click(function() {
        sql = "SELECT ";
        $("#hds_key_list option:selected").each(function () {
        var $this = $(this);
        if ($this.length) {
            var selText = $this.text();
            sql += selText + ', ';
        }
        });
        sql = sql.substr(0, sql.length-2);
        sql += " FROM " + $("#hds_table_list option:selected").text();
        console.log(sql);
        access1 = 'http://'+$("#hds_server").val()+'/dataservice/v1/access?from=jdbc:///&info=jdbc:phoenix:zoo1:2181&query='+sql+'&to=file:///tmp/web_download_tmp/'+$("#download_file_name").val()+'.csv&async=true&redirectfrom=dcfs-worker1'
        //href = 'http://'+$("#hds_server").val()+'/dataservice/v1/list?from=jdbc:///&info=jdbc:phoenix:zoo1:2181'
        access1 = encodeURI(access1)
        access2 = 'http://'+$("#hds_server").val()+'/dataservice/v1/access?from=file:///tmp/web_download_tmp/'+$("#download_file_name").val()+'.csv&to=local:///'+$("#download_file_name").val()+'.csv'
        $.ajax({
            "type": "GET",
            "dataType": "json",
            "contentType": "application/json",
            "url": access1,
            "timeout": 30000,
            success: function(result) {
                tk_id=JSON.stringify(result['task']['id']).replace(/%/gi,"%25")
                tk_id=tk_id.replace(/"/gi,"")
                $('#hds_page_task_id').text(tk_id);
                $('#hds_rest_api').text(access1);
                $('#download_rest_api').text(access2);
                watch_api = 'http://dcfs-worker1:8000/dataservice/v1/watch?id='+tk_id+''
                $('#watch_rest_api').text(watch_api);
                
            },
            error: function(jqXHR, JQueryXHR, textStatus) {
                alert("Download failed");
            }
        });

        /*href = 'http://'+$("#hds_server").val()+'/dataservice/v1/access?from=jdbc:///&info=jdbc:phoenix:zoo1:2181&query='+sql+'&to=local:///result.csv'
        href = encodeURI(href)
        new_a = $.parseHTML('<a href='+href+' class="link-success">'+href+'</a>');
        $('#hds_key_list').parent().append(new_a);*/
        
    });
    $("#conn_hds").click(function() {
        $.ajax({
            "type": "GET",
            "dataType": "json",
            "contentType": "application/json",
            "url": 'http://'+$("#hds_server").val()+'/dataservice/v1/list?from=jdbc:///&info=jdbc:phoenix:zoo1:2181',
            "timeout": 30000,
            success: function(result) {
                // clear original options
                children = $('#hds_table_list').children();
                for (i = 1; i < children.length; ++i) {
                    children[i].remove();
                }
                $('#hds_table_list')[0].selectedIndex = 0;

                table_list = result['dataInfo']['Table name'].split(', ');
                for (key in table_list) {
                    opt_idx = parseInt(key) + 1
                    $('#hds_table_list').append('<option value="' + opt_idx + '">' + table_list[key] + '</option>');
                }
                alert("Connect HDS success");
            },
            error: function(jqXHR, JQueryXHR, textStatus) {
                alert("Connect HDS failed");
            }
        });
    });
    $("#hds_table_list").change(function() {
        tbl_sel_idx = $(this)[0].selectedIndex;
        if (tbl_sel_idx != 0) {
            tbl_name = $(this).children().eq(tbl_sel_idx).text();
            $.ajax({
                "type": "GET",
                "dataType": "json",
                "contentType": "application/json",
                "url": 'http://'+$("#hds_server").val()+'/dataservice/v1/list?from=jdbc:///&info=jdbc:phoenix:zoo1:2181' + '&table=' + tbl_name,
                "timeout": 30000,
                success: function(result) {
                    // clear original options
                    children = $('#hds_key_list').children();
                    for (i = 0; i < children.length; ++i) {
                        children[i].remove();
                    }

                    key_list = result['dataInfo']['Column name'].split(', ');
                    for (key in key_list) {
                        opt_idx = parseInt(key) + 1
                        $('#hds_key_list').append('<option value="' + opt_idx + '">' + key_list[key] + '</option>');
                    }
                },
                error: function(jqXHR, JQueryXHR, textStatus) {
                    alert("Connect HDS failed");
                }
            });
        } else {
            children = $('#hds_key_list').children();
            for (i = 0; i < children.length; ++i) {
                children[i].remove();
            }
        }
    });
    /* ==================== HDS  ====================== */

    /* ================== SendTask ==================== */
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
    $("#send_req").click(function() {
        task_id = _uuid();
        $("#sent_task_id").text('task_id = ' + task_id);

        key_info = {}
        primary_key = $('input[name=flexRadioDefault]:checked', '#col_opt_list').val();
        l = $("select[id^=typeopt_]");
        for (i = 0; i < l.length; ++i) {
            key = l.eq(i).attr('id').substring('typeopt_'.length);
            opt = l.eq(i).val();
            key_info[key] = {
                'key': key,
                'type': opt,
                'is_primary': primary_key == key
            }
        }

        hds_sql     = gen_hds_sql(key_info);
        hds_table   = $('#hds_table_name').val().replace(/ /g,"_");
        hds_columns = gen_hds_columns(key_info);

        $("#hds_genres").text(hds_sql);

        if((($("#db1_list").val() != "MongoDB")) && (($("#db2_list").val() != "MongoDB"))){
            task_info = gen_task_info_2(
                task_id,
                username_1, password_1, ip_1, port_1, 
                db_name_1, sql_1,
                username_2, password_2, ip_2, port_2,
                db_name_2, sql_2,
                join_sql, hds_sql, hds_table, hds_columns
                );
                $('#task_info').text(JSON.stringify(task_info));
        }else{
            task_info = gen_task_info(
            task_id,
            username_1, password_1, ip_1, port_1, 
            db_name_1, sql_1,
            username_2, password_2, ip_2, port_2,
            db_name_2, tbl_name_2, mongodb_filter,
            join_sql, hds_sql, hds_table, hds_columns
            );
            $('#task_info').text(JSON.stringify(task_info));
        }
        


        queue = 'task_req'
        msg   = encodeURI($('#task_info').text());
        $.ajax({
            "type": "POST",
            "xhrFields": {
                "withCredentials": true
            },
            "dataType": "json",
            "contentType": "application/json",
            "url": "http://192.168.103.52:15672/api/exchanges/%2F/amq.default/publish", 
            "data": '{"vhost":"/","name":"amq.default","properties":{"delivery_mode":1,"headers":{}},"routing_key":"'+queue+'","delivery_mode":"1","payload":"'+msg+'","headers":{},"props":{},"payload_encoding":"string"}',
            success: function(result) {
                alert("Message sent");
            },
            error: function(jqXHR, JQueryXHR, textStatus) {
                alert("Error sending message to MQ");
            }
        });
    });

    /*========= send import request ===========*/
    $("#import_send_req").click(function() {
        task_id = _uuid();
        $("#import_sent_task_id").text('task_id = ' + task_id);

        key_info = {}
        primary_key = $('input[name=flexRadioDefault]:checked', '#import_col_opt_list').val();
        l = $("select[id^=typeopt_]");
        for (i = 0; i < l.length; ++i) {
            key = l.eq(i).attr('id').substring('typeopt_'.length);
            opt = l.eq(i).val();
            key_info[key] = {
                'key': key,
                'type': opt,
                'is_primary': primary_key == key
            }
        }
        
        hds_sql     = import_gen_hds_sql(key_info);
        hds_table   = $('#import_hds_table_name').val().replace(/ /g,"_");
        hds_columns = gen_hds_columns(key_info);

        $("#import_hds_genres").text(hds_sql);

        if((($("#dblist").val() != "MongoDB"))){
            task_info = import_gen_task_info(
                task_id,
                username, password, ip, port, 
                db_name, import_sql,
                hds_sql, hds_table, hds_columns
                );
                $('#import_task_info').text(JSON.stringify(task_info));
        }else{
            task_info = import_gen_task_info_2(
            task_id,
            username, password, ip, port,
            db_name, tbl_name, mongodb_filter,
            hds_sql, hds_table, hds_columns
            );
            $('#import_task_info').text(JSON.stringify(task_info));
        }
        


        queue = 'task_req'
        msg   = encodeURI($('#import_task_info').text());
        $.ajax({
            "type": "POST",
            "xhrFields": {
                "withCredentials": true
            },
            "dataType": "json",
            "contentType": "application/json",
            "url": "http://192.168.103.52:15672/api/exchanges/%2F/amq.default/publish", 
            "data": '{"vhost":"/","name":"amq.default","properties":{"delivery_mode":1,"headers":{}},"routing_key":"'+queue+'","delivery_mode":"1","payload":"'+msg+'","headers":{},"props":{},"payload_encoding":"string"}',
            success: function(result) {
                alert("Message sent");
            },
            error: function(jqXHR, JQueryXHR, textStatus) {
                alert("Error sending message to MQ");
            }
        });
    });
    /*========= send import request ===========*/

    /* ================== SendTask ==================== */



    

    /* ================= data import ================= */
    $("#dblist").change(function() {
        sel_idx = $(this).val();
        if (sel_idx == "MySQL") {
            $('#server').val("192.168.103.52:3306");
            $('#username').val("brad");
            $('#password').val("00000000");
            $("#connect").text("Connect MySQL")
        }else if(sel_idx == "MsSQL"){
            $('#server').val("192.168.103.52:1433");
            $('#username').val("SA");
            $('#password').val("00000000Xx");
            $("#connect").text("Connect MsSQL")
        }else if(sel_idx == "Oracle"){
            $('#server').val("192.168.103.60:1521");
            $('#username').val("brad");
            $('#password').val("00000000");
            $("#connect").text("Connect Oracle")
        }else if(sel_idx == "MongoDB"){
            $('#server').val("192.168.103.52:27017");
            $('#username').val("brad");
            $('#password').val("00000000");
            $("#connect").text("Connect MongoDB")
        }else if(sel_idx == "Cassandra"){
            $('#server').val("192.168.103.125:9042");
            $('#username').val("brad");
            $('#password').val("00000000");
            $("#connect").text("Connect Casseandra")
        }else if(sel_idx == "Elasticsearch"){
            $('#server').val("192.168.103.125:9200");
            $('#username').val("brad");
            $('#password').val("00000000");
            $("#connect").text("Connect Elasticsearch")
        }
    });
    $("#connect").click(function() {
        /* ==================== MySQL & MsSQL & Oracle & cassandra ==================== */
        if(  ($("#dblist").val() != "MongoDB") ){
            database = $("#dblist").val().toLowerCase();
            username = $('#username').val();
            password = $('#password').val();
            ip_port = $('#server').val().split(':');
            ip = ip_port[0]
            port = ip_port[1]
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;
            $.ajax({
                "type": "GET",
                "dataType": "json",
                "contentType": "application/json",
                "url": 'http://192.168.103.62:5000/' +database+ '/listdbs?' + args,
                "timeout": 30000,
                success: function(result) {
                    // clear original options
                    children = $('#import_db_list').children();
                    for (i = 1; i < children.length; ++i) {
                        children[i].remove();
                    }
                    $('#import_db_list')[0].selectedIndex = 0;

                    db_list = result['db_list'];
                    for (key in db_list) {
                        opt_idx = parseInt(key) + 1
                        $('#import_db_list').append('<option value="' + opt_idx + '">' + db_list[key] + '</option>');

                    }

                    $("#import_status").text("Connect success");
                },
                error: function(jqXHR, JQueryXHR, textStatus) {
                    $("#import_status").text("Connect failed");
                }
            });
            /* ==================== MySQL & MsSQL & Oracle & cassandra ==================== */
        }else{
            /* =================== MongoDB =================== */
            $.ajax({
                "type": "GET",
                "dataType": "json",
                "contentType": "application/json",
                "url": 'http://192.168.103.62:5000/mongo/listdbs',
                "timeout": 30000,
                success: function(result) {
                    // clear original options
                    children = $('#import_db_list').children();
                    for (i = 1; i < children.length; ++i) {
                        children[i].remove();
                    }
                    $('#import_db_list')[0].selectedIndex = 0;

                    db_list = result['db_list'];
                    for (key in db_list) {
                        opt_idx = parseInt(key) + 1
                        $('#import_db_list').append('<option value="' + opt_idx + '">' + db_list[key] + '</option>');

                    }

                    $("#import_status").text("Connect success");
                },
                error: function(jqXHR, JQueryXHR, textStatus) {
                    $("#import_status").text("Connect failed");
                }
            });
            /* =================== MongoDB =================== */
        }
        
    });
    $("#import_db_list").change(function() {
        /* ==================== MySQL & MsSQL & Oracle & cassandra ==================== */
        if(  ($("#dblist").val() != "MongoDB") ){
            database = $("#dblist").val().toLowerCase();
            username = $('#username').val();
            password = $('#password').val();
            ip_port = $('#server').val().split(':');
            ip = ip_port[0]
            port = ip_port[1]
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;

            sel_idx = $(this)[0].selectedIndex;
            if (sel_idx != 0) {
                db_name = $(this).children().eq(sel_idx).text();
                args += '&db_name=' + db_name;
                $.ajax({
                    "type": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "url": 'http://192.168.103.62:5000/' +database+ '/listtables?' + args,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#import_table_list').children();
                        for (i = 1; i < children.length; ++i) {
                            children[i].remove();
                        }
                        $('#import_table_list')[0].selectedIndex = 0;

                        table_list = result['table_list'];
                        for (key in table_list) {
                            opt_idx = parseInt(key) + 1
                            $('#import_table_list').append('<option value="' + opt_idx + '">' + table_list[key] + '</option>');

                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $("#import_status").text("Connect failed");
                    }
                });
            } else {
                children = $('#import_table_list').children();
                for (i = 1; i < children.length; ++i) {
                    children[i].remove();
                }
                $('#import_table_list')[0].selectedIndex = 0;
            }
            /* ==================== MySQL & MsSQL & Oracle & cassandra==================== */
        }else{
            /* =================== MongoDB =================== */
            sel_idx = $(this)[0].selectedIndex;
            if (sel_idx != 0) {
                db_name = $(this).children().eq(sel_idx).text();
                $.ajax({
                    "type": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "url": 'http://192.168.103.62:5000/mongo/listcollections?db_name=' + db_name,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#import_table_list').children();
                        for (i = 1; i < children.length; ++i) {
                            children[i].remove();
                        }
                        $('#import_table_list')[0].selectedIndex = 0;
    
                        collection_list = result['collection_list'];
                        for (key in collection_list) {
                            opt_idx = parseInt(key) + 1
                            $('#import_table_list').append('<option value="' + opt_idx + '">' + collection_list[key] + '</option>');
    
                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $("#import_status").text("Connect failed");
                    }
                });
            } else {
                children = $('#import_table_list').children();
                for (i = 1; i < children.length; ++i) {
                    children[i].remove();
                }
                $('#import_table_list')[0].selectedIndex = 0;
            }
        }
        /* =================== MongoDB =================== */
    });
    $("#import_table_list").change(function() {
        /* ==================== MySQL & MsSQL & Oracle & cassandra==================== */
        if(  ($("#dblist").val() != "MongoDB") ){
            database = $("#dblist").val().toLowerCase();
            username = $('#username').val();
            password = $('#password').val();
            ip_port = $('#server').val().split(':');
            ip = ip_port[0]
            port = ip_port[1]
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;

            db_sel_idx = $("#import_db_list")[0].selectedIndex;
            tbl_sel_idx = $(this)[0].selectedIndex;
            if (tbl_sel_idx != 0) {
                db_name = $("#import_db_list").children().eq(db_sel_idx).text();
                tbl_name = $(this).children().eq(tbl_sel_idx).text();
                args += '&db_name=' + db_name;
                args += '&table_name=' + tbl_name;
                $.ajax({
                    "type": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "url": 'http://192.168.103.62:5000/' +database+ '/listkeys?' + args,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#import_key_list').children();
                        for (i = 0; i < children.length; ++i) {
                            children[i].remove();
                        }

                        key_list = result['key_list'];
                        for (key in key_list) {
                            opt_idx = parseInt(key) + 1
                            $('#import_key_list').append('<option value="' + opt_idx + '">' + key_list[key] + '</option>');
                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $("#import_status").text("Connect failed");
                    }
                });
            } else {
                children = $('#import_key_list').children();
                for (i = 0; i < children.length; ++i) {
                    children[i].remove();
                }
            }
        /* ==================== MySQL & MsSQL & Oracle & cassandra==================== */
        }else{
            /* =================== MongoDB =================== */
            db_sel_idx = $("#import_db_list")[0].selectedIndex;
            tbl_sel_idx = $(this)[0].selectedIndex;
            if (tbl_sel_idx != 0) {
                db_name = $("#import_db_list").children().eq(db_sel_idx).text();
                tbl_name = $(this).children().eq(tbl_sel_idx).text();
                $.ajax({
                    "type": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "url": 'http://192.168.103.62:5000/mongo/listkeys?db_name=' + db_name + '&collection_name=' + tbl_name,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#import_key_list').children();
                        for (i = 0; i < children.length; ++i) {
                            children[i].remove();
                        }

                        key_list = result['key_list'];
                        key_list.splice(key_list.indexOf('_id'), 1);
                        for (key in key_list) {
                            opt_idx = parseInt(key) + 1
                            $('#import_key_list').append('<option value="' + opt_idx + '">' + key_list[key] + '</option>');
                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $("#import_status").text("Connect MongoDB failed");
                    }
                });
            } else {
                children = $('#import_key_list').children();
                for (i = 0; i < children.length; ++i) {
                    children[i].remove();
                }
            }
            /* =================== MongoDB =================== */
        }
    });
    $("#import_create_req").click(function() {
        
       
       username = $('#username').val();
       password = $('#password').val();
       ip_port = $('#server').val().split(':');
       ip = ip_port[0]
       port = ip_port[1]
       db_name = $('#import_db_list').children()
           .eq($('#import_db_list')[0].selectedIndex)
           .text();
       tbl_name = $('#import_table_list').children()
           .eq($('#import_table_list')[0].selectedIndex)
           .text();
       mysql_key_sel_idx = $('#import_key_list').val();
       key_names_1 = [];
       for (i in mysql_key_sel_idx) {
           key_names_1.push(
               $('#import_key_list').children()
               .eq(mysql_key_sel_idx[i] - 1).text());
       }
       
       switch($("#dblist").val()){
            case "MongoDB":
                mongodb_filter = mongodb_gen_filter(key_names_1);
                $('#import_genres').text(JSON.stringify(mongodb_filter));
                break;
            case "Oracle":
                isOracle=1;
                import_sql = mysql_gen_sql(tbl_name, key_names_1,isOracle);
                $('#import_genres').text(import_sql);
                break;
            case "Cassandra":
                import_sql='SELECT * FROM '+db_name+'.'+tbl_name+'';
                $('#import_genres').text(import_sql);
                break;
            case "Elasticsearch":
                import_sql='SELECT * FROM '+tbl_name+'';
                $('#import_genres').text(import_sql);
                break;
            default:
                isOracle=0;
                import_sql = mysql_gen_sql(tbl_name, key_names_1,isOracle);
                $('#import_genres').text(import_sql);
       }
       
       key_names_2=[];

       import_gen_col_opt_elems(key_names_1, key_names_2);
   });
   /* ================= TaskStatus =================== */
   function send_task_status_req() {
        args = ''
        ids = $('#task_ids').text();
        if (ids !== '') {
            args = '?task_id=' + ids.replace(/\s/g, '');
        }
        $.ajax({
            "type": "GET",
            "dataType": "json",
            "contentType": "application/json",
            "url": 'http://192.168.103.62:5000/taskstatus' + args,
            "timeout": 30000,
            success: function(result) {
                children = $('#task_status_res').children();
                for (i = 1; i < children.length; ++i) {
                    children[i].remove();
                }
                for (i in result) {
                    task = result[i];
                    task_id = task['task_id'];
                    task_scode = task['status'];
                    task_msg = task['message'];
                    task_status = ''
                    switch (task_scode) {
                    case 1:
                        task_status = "ACCEPTED";
                        break;
                    case 2:
                        task_status = "PROCESSING";
                        break;
                    case 3:
                        task_status = "SUCCEEDED";
                        break;
                    case 4:
                        task_status = "FAILED";
                        break;
                    case 5:
                        task_status = "ERROR";
                        break;
                    case 6:
                        task_status = "UNKNOWN";
                        break;
                    }

                    elem = $("#task_res_template").clone().appendTo($("#task_status_res")[0]);
                    elem.removeAttr('id');
                    elem.css('visibility', 'visible');
                    elem.children().eq(0).children().eq(1).text(task_id);
                    elem.children().eq(1).children().eq(1).text(task_status);
                    elem.children().eq(2).children().eq(1).text(task_msg);
                }
            },
            error: function(jqXHR, JQueryXHR, textStatus) {
                alert("Failed to get task status");
            }
        });
    }   
    // $("#send_task_status").click(send_task_status_req);
    setInterval(send_task_status_req, 2000);
    /* ================= TaskStatus =================== */
});