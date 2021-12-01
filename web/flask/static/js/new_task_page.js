$(document).ready(function() {
    // for the controls on the left & right panels
    for (__i = 1; __i <= 2; ++__i) {
        // use const, or the following `db_id` will be changed as global `_i` is changed
        const db_id = __i;
        $('#db' + db_id + '_list').change(function() {
            sel_idx = $(this).val();
            for (db_type in db_config) {
                if (sel_idx == db_type) {
                    ip = db_config[db_type]['ip'];
                    port = db_config[db_type]['port'];
                    username = db_config[db_type]['username'];
                    password = db_config[db_type]['password'];
                    $('#db' + db_id + '_server').val(ip + ':' + port);
                    $('#db' + db_id + '_username').val(username);
                    $('#db' + db_id + '_password').val(password);
                    $('#conn_db' + db_id + '').text("Connect " + db_type);
                }
            }
        });

        $('#conn_db' + db_id + '').click(function() {
            database = $('#db' + db_id + '_list').val().toLowerCase();
            username = $('#db' + db_id + '_username').val();
            password = $('#db' + db_id + '_password').val();
            ip_port = $('#db' + db_id + '_server').val().split(':');
            ip = ip_port[0];
            port = ip_port[1];
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;
            $.ajax({
                "type": "GET",
                "dataType": "json",
                "contentType": "application/json",
                "url": flask_http_url + database + '/listdbs?' + args,
                "timeout": 30000,
                success: function(result) {
                    // clear original options
                    children = $('#db' + db_id + '_db_list').children();
                    for (i = 1; i < children.length; ++i) {
                        children[i].remove();
                    }
                    $('#db' + db_id + '_db_list')[0].selectedIndex = 0;

                    db_list = result['db_list'];
                    for (key in db_list) {
                        opt_idx = parseInt(key) + 1
                        $('#db' + db_id + '_db_list').append('<option value="' + opt_idx + '">' + db_list[key] + '</option>');

                    }

                    $('#conn_db' + db_id + '_status').text("Connect suceeded");
                },
                error: function(jqXHR, JQueryXHR, textStatus) {
                    $('#conn_db' + db_id + '_status').text("Connect failed");
                }
            });
        });

        $('#db' + db_id + '_db_list').change(function() {
            database = $('#db' + db_id + '_list').val().toLowerCase();
            username = $('#db' + db_id + '_username').val();
            password = $('#db' + db_id + '_password').val();
            ip_port = $('#db' + db_id + '_server').val().split(':');
            ip = ip_port[0];
            port = ip_port[1];
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
                    "url": flask_http_url + database + '/listtables?' + args,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#db' + db_id + '_table_list').children();
                        for (i = 1; i < children.length; ++i) {
                            children[i].remove();
                        }
                        $('#db' + db_id + '_table_list')[0].selectedIndex = 0;

                        table_list = result['table_list'];
                        for (key in table_list) {
                            opt_idx = parseInt(key) + 1
                            $('#db' + db_id + '_table_list').append('<option value="' + opt_idx + '">' + table_list[key] + '</option>');

                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $('#conn_db' + db_id + '_status').text("Connect failed");
                    }
                });
            } else {
                children = $('#db' + db_id + '_table_list').children();
                for (i = 1; i < children.length; ++i) {
                    children[i].remove();
                }
                $('#db' + db_id + '_table_list')[0].selectedIndex = 0;
            }
        });

        $('#db' + db_id + '_table_list').change(function() {
            database = $('#db' + db_id + '_list').val().toLowerCase();
            username = $('#db' + db_id + '_username').val();
            password = $('#db' + db_id + '_password').val();
            ip_port = $('#db' + db_id + '_server').val().split(':');
            ip = ip_port[0];
            port = ip_port[1];
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;

            db_sel_idx = $('#db' + db_id + '_db_list')[0].selectedIndex;
            tbl_sel_idx = $(this)[0].selectedIndex;
            if (tbl_sel_idx != 0) {
                db_name = $('#db' + db_id + '_db_list').children().eq(db_sel_idx).text();
                tbl_name = $(this).children().eq(tbl_sel_idx).text();
                args += '&db_name=' + db_name;
                args += '&table_name=' + tbl_name;
                $.ajax({
                    "type": "GET",
                    "dataType": "json",
                    "contentType": "application/json",
                    "url": flask_http_url + database + '/listkeys?' + args,
                    "timeout": 30000,
                    success: function(result) {
                        // clear original options
                        children = $('#db' + db_id + '_key_list').children();
                        for (i = 0; i < children.length; ++i) {
                            children[i].remove();
                        }

                        key_list = result['key_list'];
                        for (key in key_list) {
                            opt_idx = parseInt(key) + 1
                            $('#db' + db_id + '_key_list').append('<option value="' + opt_idx + '">' + key_list[key] + '</option>');
                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $('#conn_db' + db_id + '_status').text("Connect failed");
                    }
                });
            } else {
                children = $('#db' + db_id + '_key_list').children();
                for (i = 0; i < children.length; ++i) {
                    children[i].remove();
                }
            }
        });
    }

    $("#create_req").click(function() {
        update_db1_info();
        update_db2_info();
        const intersections = db1_keylist.filter(function(n) {
            return db2_keylist.indexOf(n) !== -1;
        });
        if (intersections.length == 1) {
            gen_col_opt_elems(db1_keylist.map(txt => txt.toUpperCase()), db2_keylist.map(txt => txt.toUpperCase()));
        }
        else if (intersections.length == 0) {
            alert("No intersection between the two groups");
        }
        else {
            alert("There can only be one intersection between the two groups");
        }
    });


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

        try {
            join_sql = sql_gen_join(db1_keylist.map(txt => txt.toUpperCase()), db2_keylist.map(txt => txt.toUpperCase()));
        } catch (error) {
            alert("Error generating JOIN SQL. Message = " + error);
            return;
        }

        hds_table = $('#hds_table_name').val().replace(/ /g, "_").toUpperCase();
        hds_sql = gen_hds_sql(hds_table, key_info);
        if (hds_table == '') {
            alert("HDS Table Name cannot be empty");
            return;
        }
        hds_columns = gen_hds_columns(key_info);

        update_db1_info();
        update_db2_info();

        task_info = gen_task_info(
            task_id,
            db1_type, db1_ip, db1_port, db1_username, db1_password, db1_dbname, db1_tblname, db1_keylist,
            db2_type, db2_ip, db2_port, db2_username, db2_password, db2_dbname, db2_tblname, db2_keylist,
            join_sql,
            hds_sql, hds_table, hds_columns
        );

        $('#db1_genres').text(JSON.stringify(task_info['db'][0]));
        $('#db2_genres').text(JSON.stringify(task_info['db'][1]));
        $('#join_genres').text(join_sql);
        $("#hds_genres").text(hds_sql);
        $('#task_info').text(JSON.stringify(task_info));

        queue = 'task_req'
        msg = encodeURI($('#task_info').text());
        $.ajax({
            "type": "POST",
            "xhrFields": {
                "withCredentials": true
            },
            "dataType": "json",
            "contentType": "application/json",
            "url": "http://" + flask_ip + ":15672" + "/api/exchanges/%2F/amq.default/publish",
            "data": '{"vhost":"/","name":"amq.default","properties":{"delivery_mode":1,"headers":{}},"routing_key":"' + queue + '","delivery_mode":"1","payload":"' + msg + '","headers":{},"props":{},"payload_encoding":"string"}',
            success: function(result) {
                alert("Message sent");
            },
            error: function(jqXHR, JQueryXHR, textStatus) {
                alert("Error sending message to MQ");
            }
        });
    });
});

// update variables about db1 from controls
function update_db1_info() {
    db1_type = $("#db1_list").val().toLowerCase();
    db1_username = $('#db1_username').val();
    db1_password = $('#db1_password').val();
    db1_ip_port  = $('#db1_server').val().split(':');
    db1_ip   = db1_ip_port[0];
    db1_port = db1_ip_port[1];
    db1_dbname = $('#db1_db_list').children()
        .eq($('#db1_db_list')[0].selectedIndex)
        .text();
    db1_tblname = $('#db1_table_list').children()
        .eq($('#db1_table_list')[0].selectedIndex)
        .text();
    db1_key_selidx_list = $('#db1_key_list').val();
    db1_keylist = [];
    for (i in db1_key_selidx_list) {
        db1_keylist.push(
            $('#db1_key_list').children()
            .eq(db1_key_selidx_list[i] - 1).text());
    }
}

// update variables about db2 from controls
function update_db2_info() {
    db2_type = $("#db2_list").val().toLowerCase();
    db2_username = $('#db2_username').val();
    db2_password = $('#db2_password').val();
    db2_ip_port  = $('#db2_server').val().split(':');
    db2_ip   = db2_ip_port[0];
    db2_port = db2_ip_port[1];
    db2_dbname = $('#db2_db_list').children()
        .eq($('#db2_db_list')[0].selectedIndex)
        .text();
    db2_tblname = $('#db2_table_list').children()
        .eq($('#db2_table_list')[0].selectedIndex)
        .text();
    db2_key_selidx_list = $('#db2_key_list').val();
    db2_keylist = [];
    for (i in db2_key_selidx_list) {
        db2_keylist.push(
            $('#db2_key_list').children()
            .eq(db2_key_selidx_list[i] - 1).text());
    }
}

function gen_col_opt_elems(db1_keylist, db2_keylist) {
    key_names = db1_keylist.concat(db2_keylist);
    key_names = key_names.filter(function(value, index, self) {
        return self.indexOf(value) === index;
    });

    children = $('#col_opt_list').children();
    for (i = 1; i < children.length; ++i) {
        children[i].remove();
    }

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