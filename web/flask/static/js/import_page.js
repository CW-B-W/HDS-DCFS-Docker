$(document).ready(function() {
    $("#dblist").change(function() {
        sel_idx = $(this).val();
        for (db_type in db_config) {
            if (sel_idx == db_type) {
                ip = db_config[db_type]['ip'];
                port = db_config[db_type]['port'];
                username = db_config[db_type]['username'];
                password = db_config[db_type]['password'];
                $('#server').val(ip + ':' + port);
                $('#username').val(username);
                $('#password').val(password);
                $('#connect').text("Connect " + db_type);
            }
        }
    });


    $("#connect").click(function() {
        database = $('#dblist').val().toLowerCase();
        username = $('#username').val();
        password = $('#password').val();
        ip_port  = $('#server').val().split(':');
        ip   = ip_port[0];
        port = ip_port[1];
        args = 'username=' + username;
        args += '&password=' + password;
        args += '&ip=' + ip;
        args += '&port=' + port;
        $.ajax({
            "type": "GET",
            "dataType": "json",
            "contentType": "application/json",
            "url": flask_http_url+"/" + database + '/listdbs?' + args,
            "timeout": 30000,
            success: function(result) {
                // clear original options
                children = $('#import_db_list').children();
                for (i = 1; i < children.length; ++i) {
                    children[i].remove();
                }
                $('#import_db_list').selectedIndex = 0;

                db_list = result['db_list'];
                for (key in db_list) {
                    opt_idx = parseInt(key) + 1
                    $('#import_db_list').append('<option value="' + opt_idx + '">' + db_list[key] + '</option>');
                }

                $("#import_status").text("Connect suceeded");
            },
            error: function(jqXHR, JQueryXHR, textStatus) {
                $("#import_status").text("Connect failed");
            }
        });        
    });

    $("#import_db_list").change(function() {
        database = $('#dblist').val().toLowerCase();
        username = $('#username').val();
        password = $('#password').val();
        ip_port  = $('#server').val().split(':');
        ip   = ip_port[0];
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
                "url": flask_http_url+"/" + database + '/listtables?' + args,
                "timeout": 30000,
                success: function(result) {
                    // clear original options
                    children = $('#import_table_list').children();
                    for (i = 1; i < children.length; ++i) {
                        children[i].remove();
                    }
                    $('#import_table_list').selectedIndex = 0;

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
            $('#import_db_list').selectedIndex = 0;
        }
    });

    
    $("#import_table_list").change(function() {
        database = $('#dblist').val().toLowerCase();
        username = $('#username').val();
        password = $('#password').val();
        ip_port  = $('#server').val().split(':');
        ip   = ip_port[0];
        port = ip_port[1];
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
                "url": flask_http_url+"/" + database + '/listkeys?' + args,
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
    });

    $("#import_create_req").click(function() {
        db_type = $('#db1_list').val().toLowerCase();
        is_append_task = $('#import_task_append').is(':checked');
        if (is_append_task) {
            $('#import_key_list').attr('disabled', true);
            tbl_name = $('#import_hds_table_name').val().replace(/ /g, "_").toUpperCase();
            if (tbl_name == '') {
                alert("HDS Table Name cannot be empty");
                return;
            }
            zoo_url = hds_zoo_ip + ':' + hds_zoo_port;
            $.ajax({
                "type": "GET",
                "dataType": "json",
                "contentType": "application/json",
                "url": 'http://'+$("#hds_server").val()+'/dataservice/v1/list?from=jdbc:///&info=jdbc:phoenix:' + zoo_url + '&table=' + tbl_name,
                "timeout": 30000,
                success: function(result) {
                    db_sel_list = [];
    
                    key_list = result['dataInfo']['Column name'].split(', ');
                    task_append_error = false;
                    for (key in key_list) {
                        key_name = key_list[key];
                        in_db = false;
                        $('#import_key_list').children().each(function() {
                            if (to_matching_key(db_type, $(this).text()) == key_name) {
                                db_sel_list.push($(this).val().toString());
                                in_db = true;
                            }
                        });
                        if (!in_db) {
                            alert(`Cannot find key ${key_name} in any of the source tables`);
                            task_append_error = true;
                        }
                    }
                    $('#import_key_list').val(db_sel_list);
    
                    if (task_append_error) {
                        throw `Cannot append to table ${tbl_name}`;
                    }
    
                    update_db_info();
                    import_gen_col_opt_elems(db_keylist.map(txt => to_matching_key(db_type, txt)));
                },
                error: function(jqXHR, JQueryXHR, textStatus) {
                    alert("Connect HDS failed");
                }
            });
        }
        else {
            update_db_info();
            import_gen_col_opt_elems(db_keylist.map(txt => to_matching_key(db_type, txt)));
        }
    });

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

        hds_table = $('#import_hds_table_name').val().replace(/ /g, "_").toUpperCase();
        if (is_append_task)
            hds_sql = '';
        else
            hds_sql = gen_hds_sql(hds_table, key_info);
        if (hds_table == '') {
            alert("HDS Table Name cannot be empty");
            return;
        }
        hds_columns = gen_hds_columns(key_info);

        update_db_info();

        db_namemapping = gen_namemapping(db_type, db_keylist, hds_columns);

        task_info = gen_task_info_single(
            task_id,
            db_type, db_ip, db_port, db_username, db_password, db_dbname, db_tblname, db_keylist, db_namemapping,
            hds_sql, hds_table, hds_columns
        );

        $('#import_genres').text(JSON.stringify(task_info['db'][0]['sql']));
        $("#import_hds_genres").text(hds_sql);
        $('#import_task_info').text(JSON.stringify(task_info));

        queue = 'task_req'
        msg = encodeURI($('#import_task_info').text());
        $.ajax({
            "type": "POST",
            "xhrFields": {
                "withCredentials": true
            },
            "dataType": "json",
            "contentType": "application/json",
            "url": rabbitmq_http_url + "/api/exchanges/%2F/amq.default/publish",
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

// update variables about db from controls
function update_db_info() {
    db_type = $("#dblist").val().toLowerCase();
    db_username = $('#username').val();
    db_password = $('#password').val();
    db_ip_port  = $('#server').val().split(':');
    db_ip   = db_ip_port[0];
    db_port = db_ip_port[1];
    db_dbname = $('#import_db_list').children()
        .eq($('#import_db_list')[0].selectedIndex)
        .text();
    db_tblname = $('#import_table_list').children()
        .eq($('#import_table_list')[0].selectedIndex)
        .text();
    db_key_selidx_list = $('#import_key_list').val();
    db_keylist = [];
    for (i in db_key_selidx_list) {
        db_keylist.push(
            $('#import_key_list').children()
            .eq(db_key_selidx_list[i] - 1).text());
    }
}

function import_gen_col_opt_elems(db1_keylist) {
    key_names = db1_keylist;
    key_names = key_names.filter(function(value, index, self) {
        return self.indexOf(value) === index;
    });

    children = $('#import_col_opt_list').children();
    for (i = 1; i < children.length; ++i) {
        children[i].remove();
    }

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