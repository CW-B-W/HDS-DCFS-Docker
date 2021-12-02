$(document).ready(function() {
    /* =================== GenTask =================== */

    // function gen_task_info( //mongo + others, mongo only can put on right side.
    //     task_id,
    //     mysql_username, mysql_password, mysql_ip, mysql_port,
    //     mysql_db_name, mysql_sql,
    //     mongodb_username, mongodb_password, mongodb_ip, mongodb_port, 
    //     mongodb_db_name, mongodb_collection_name, mongodb_filter,
    //     join_sql,
    //     hds_sql, hds_table, hds_columns
    // ){
    //     task_info = {
    //         'task_id': task_id,
    //         'db': [
    //             {
    //                 'type': $("#db1_list").val().toLowerCase(),
    //                 'username': mysql_username,
    //                 'password': mysql_password,
    //                 'ip': mysql_ip,
    //                 'port': mysql_port,
    //                 'db': mysql_db_name,
    //                 'sql': mysql_sql
    //             },
    //             {
    //                 'type': 'mongodb',
    //                 'username': mongodb_username,
    //                 'password': mongodb_password,
    //                 'ip': mongodb_ip,
    //                 'port': mongodb_port,
    //                 'db': mongodb_db_name,
    //                 'collection': mongodb_collection_name,
    //                 'filter': mongodb_filter
    //             }
    //         ],
    //         'join_sql': join_sql,
    //         'hds': {
    //             'sql': hds_sql,        // the sql to create table
    //             'table': hds_table,
    //             'columns': hds_columns // the column names in table (ordered)
    //         }
    //     };

    //     return task_info;
    // }

    // function gen_task_info_2(
    //     task_id,
    //     db1_username, db1_password, db1_ip, db1_port,
    //     db1_db_name, db1_sql,
    //     db2_username, db2_password, mongodb_ip, mongodb_port, 
    //     mongodb_db_name, db1_sql_2,
    //     join_sql,
    //     hds_sql, hds_table, hds_columns
    // ){
    //     task_info = {
    //         'task_id': task_id,
    //         'db': [
    //             {
    //                 'type': $('#db1_list').val().toLowerCase(),
    //                 'username': db1_username,
    //                 'password': db1_password,
    //                 'ip': db1_ip,
    //                 'port': db1_port,
    //                 'db': db1_db_name,
    //                 'sql': db1_sql
    //             },
    //             {
    //                 'type': $('#db2_list').val().toLowerCase(),
    //                 'username': db2_username,
    //                 'password': db2_password,
    //                 'ip': mongodb_ip,
    //                 'port': mongodb_port,
    //                 'db': mongodb_db_name,
    //                 'sql': db1_sql_2
    //             }
    //         ],
    //         'join_sql': join_sql,
    //         'hds': {
    //             'sql': hds_sql,        // the sql to create table
    //             'table': hds_table,
    //             'columns': hds_columns // the column names in table (ordered)
    //         }
    //     };

    //     return task_info;
    // }

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
        db_name, mongodb_table_name,mongodb_filter,
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
                    'table': mongodb_table_name,
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
                "url": flask_http_url+"/" +database+ '/listdbs?' + args,
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
                "url": flask_http_url+"/"+'mongodb/listdbs',
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
                    "url": flask_http_url+"/" +database+ '/listtables?' + args,
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
                    "url": flask_http_url+"/"+'mongodb/listtables?db_name=' + db_name,
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
                    "url": flask_http_url+"/" +database+ '/listkeys?' + args,
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
                    "url": flask_http_url+"/"+'mongodb/listkeys?db_name=' + db_name + '&table_name=' + tbl_name,
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
                mongodb_filter = mongodb_gen_sql(key_names_1);
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

   
});