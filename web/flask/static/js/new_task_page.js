$(document).ready(function() {
    // for the controls on the left & right panels
    for (__i = 1; __i <= 2; ++__i) {
        // use const, or the following `db_id` will be changed as global `_i` is changed
        const db_id = __i;
        $(`#db${db_id}_list`).change(function() {
            sel_idx = $(this).val();
            for (db_type in db_config) {
                if (sel_idx == db_type) {
                    ip = db_config[db_type]['ip'];
                    port = db_config[db_type]['port'];
                    username = db_config[db_type]['username'];
                    password = db_config[db_type]['password'];
                    $(`#db${db_id}_server`).val(ip + ':' + port);
                    $(`#db${db_id}_username`).val(username);
                    $(`#db${db_id}_password`).val(password);
                    $('#conn_db' + db_id + '').text("Connect " + db_type);
                }
            }
        });

        $(`#conn_db${db_id}`).click(function() {
            database = $(`#db${db_id}_list`).val().toLowerCase();
            username = $(`#db${db_id}_username`).val();
            password = $(`#db${db_id}_password`).val();
            ip_port  = $(`#db${db_id}_server`).val().split(':');
            cached   = $(`#db${db_id}_cached`).prop("checked");
            ip = ip_port[0];
            port = ip_port[1];
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;
            args += '&cached=' + (cached ? 'True' : '');

            $.ajax({
                "type": "GET",
                "dataType": "json",
                "contentType": "application/json",
                "url": flask_http_url+"/" + database + '/listdbs?' + args,
                "timeout": 30000,
                success: function(result) {
                    // clear original options
                    children = $(`#db${db_id}_db_list`).children();
                    for (i = 1; i < children.length; ++i) {
                        children[i].remove();
                    }
                    $(`#db${db_id}_db_list`)[0].selectedIndex = 0;

                    db_list = result['db_list'];
                    for (key in db_list) {
                        opt_idx = parseInt(key) + 1
                        $(`#db${db_id}_db_list`).append('<option value="' + opt_idx + '">' + db_list[key] + '</option>');

                    }

                    $(`#conn_db${db_id}_status`).text("Connect suceeded");
                },
                error: function(jqXHR, JQueryXHR, textStatus) {
                    $(`#conn_db${db_id}_status`).text("Connect failed");
                }
            });
        });

        $(`#db${db_id}_db_list`).change(function() {
            database = $(`#db${db_id}_list`).val().toLowerCase();
            username = $(`#db${db_id}_username`).val();
            password = $(`#db${db_id}_password`).val();
            ip_port  = $(`#db${db_id}_server`).val().split(':');
            cached   = $(`#db${db_id}_cached`).prop("checked");
            ip = ip_port[0];
            port = ip_port[1];
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;
            args += '&cached=' + (cached ? 'True' : '');

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
                        children = $(`#db${db_id}_table_list`).children();
                        for (i = 1; i < children.length; ++i) {
                            children[i].remove();
                        }
                        $(`#db${db_id}_table_list`)[0].selectedIndex = 0;

                        table_list = result['table_list'];
                        for (key in table_list) {
                            opt_idx = parseInt(key) + 1
                            $(`#db${db_id}_table_list`).append('<option value="' + opt_idx + '">' + table_list[key] + '</option>');

                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $(`#conn_db${db_id}_status`).text("Connect failed");
                    }
                });
            } else {
                children = $(`#db${db_id}_table_list`).children();
                for (i = 1; i < children.length; ++i) {
                    children[i].remove();
                }
                $(`#db${db_id}_table_list`)[0].selectedIndex = 0;
            }
        });

        $(`#db${db_id}_table_list`).change(function() {
            database = $(`#db${db_id}_list`).val().toLowerCase();
            username = $(`#db${db_id}_username`).val();
            password = $(`#db${db_id}_password`).val();
            ip_port  = $(`#db${db_id}_server`).val().split(':');
            cached   = $(`#db${db_id}_cached`).prop("checked");
            ip = ip_port[0];
            port = ip_port[1];
            args = 'username=' + username;
            args += '&password=' + password;
            args += '&ip=' + ip;
            args += '&port=' + port;
            args += '&cached=' + (cached ? 'True' : '');

            db_sel_idx = $(`#db${db_id}_db_list`)[0].selectedIndex;
            tbl_sel_idx = $(this)[0].selectedIndex;
            if (tbl_sel_idx != 0) {
                db_name = $(`#db${db_id}_db_list`).children().eq(db_sel_idx).text();
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
                        children = $(`#db${db_id}_key_list`).children();
                        for (i = 0; i < children.length; ++i) {
                            children[i].remove();
                        }

                        key_list = result['key_list'];
                        for (key in key_list) {
                            opt_idx = parseInt(key) + 1
                            $(`#db${db_id}_key_list`).append('<option value="' + opt_idx + '">' + key_list[key] + '</option>');
                        }
                        $(`#db${db_id}_key_list`).append('<option value="' + (++opt_idx) + '">' + '' + '</option>');

                        while (true) {
                            entry_cnt = $('#key_table tbody>tr').length;
                            if (entry_cnt <= 0)
                                break;
                            $('#key_table tr:last').remove();
                        }
                    },
                    error: function(jqXHR, JQueryXHR, textStatus) {
                        $(`#conn_db${db_id}_status`).text("Connect failed");
                    }
                });
            } else {
                children = $(`#db${db_id}_key_list`).children();
                for (i = 0; i < children.length; ++i) {
                    children[i].remove();
                }
            }
        });

        $(`#db${db_id}_key_list`).dblclick(function() {
            db1_keylist_elem = $('#db1_key_list');
            db2_keylist_elem = $('#db2_key_list');

            db1_keys = [];
            db2_keys = [];

            if (db1_keylist_elem.val().length == 0) {
                db1_keys.push('');
            }
            else {
                for (var i = 0; i < db1_keylist_elem.val().length; ++i) {
                    var idx = parseInt(db1_keylist_elem.val()[i]) - 1;
                    db1_keys.push(db1_keylist_elem.children().eq(idx).text());
                }
            }

            if (db2_keylist_elem.val().length == 0) {
                db2_keys.push('');
            }
            else {
                for (var i = 0; i < db2_keylist_elem.val().length; ++i) {
                    var idx = parseInt(db2_keylist_elem.val()[i]) - 1;
                    db2_keys.push(db2_keylist_elem.children().eq(idx).text());
                }
            }


            if (db1_keys.length == 1 && db2_keys.length == 1) {
                key_table_insert(db1_keys[0], db2_keys[0]);
            }
            else if (db1_keys.length > 1) {
                if (!(db2_keys.length == 1 || db2_keys[i] == '')) {
                    alert("Undefined behavior of selection");
                    throw "Undefined behavior of selection";
                }
                for (var i = 0; i < db1_keys.length; ++i) {
                    key_table_insert(db1_keys[i], '');
                }
            }
            else if (db2_keys.length > 1) {
                if (!(db1_keys.length == 1 || db1_keys[i] == '')) {
                    alert("Undefined behavior of selection");
                    throw "Undefined behavior of selection";
                }
                for (var i = 0; i < db2_keys.length; ++i) {
                    key_table_insert('', db2_keys[i]);
                }
            }
        });
    }

    $("#key_table_pop").click(function (){
        key_table_pop();
    });

    $("#create_req").click(function() {
        join_pairs = get_joining_pairs();
        
        children = $('#col_opt_list').children();
        for (i = 1; i < children.length; ++i) {
            children[i].remove();
        }

        for (i = 0; i < join_pairs.length; ++i) {
            idx      = join_pairs[i]['idx'];
            leftkey  = join_pairs[i]['leftkey'];
            rightkey = join_pairs[i]['rightkey'];

            if (leftkey == '' && rightkey == '') {
                alert("Left key & Right key cannot be both empty");
                throw "Left key & Right key cannot be both empty";
            }
            else if (leftkey == '') {
                key_name = rightkey;
            }
            else {
                key_name = leftkey;
            }

            elem = $("#col_opt_template").clone().appendTo($("#col_opt_list")[0]);
            elem.removeAttr('id');
            elem.css('visibility', 'visible');
            elem.children().eq(0).children().eq(0).text(key_name);
            elem.children().eq(1).children().eq(0).attr('id', 'typeopt_'+key_name);
            elem.children().eq(3).children().eq(0).val(key_name);
            elem.children().eq(3).children().eq(1).text(key_name);
            elem.children().eq(3).children().eq(0).prop('checked', false);
            elem.children().eq(3).children().eq(0).attr('id', 'isprimary_'+key_name.replace(/[:.]/g, "_").replace(/[@]/g, ""));
        }
    });


    $("#create_taskinfo").click(function() {
        db1_type = $('#db1_list').val().toLowerCase();
        db2_type = $('#db2_list').val().toLowerCase();

        if (db1_type == 'none') {
            alert('Only DB2 can be "none"');
            throw 'Only DB2 can be "none"';
        }

        key_info = {}
        l = $("select[id^=typeopt_]");
        for (i = 0; i < l.length; ++i) {
            key        = l.eq(i).attr('id').substring('typeopt_'.length);
            opt        = l.eq(i).val();
            is_primary = $(`input[id=isprimary_${key.replace(/[:.]/g, "_").replace(/[@]/g, "")}]`).prop('checked')

            new_key = to_formatted_key(key);
            if(new_key in key_info){
                var inc = 1;
                new_key = to_formatted_key(key) + inc.toString()
                while(new_key in key_info){
                    inc += 1;
                    new_key = to_formatted_key(key) + inc.toString()
                }
            }
            key_info[new_key] = {
                'key': new_key,
                'type': opt,
                'is_primary': is_primary
            }

        }

        try {
            join_sql = sql_gen_join(join_pairs);
        } catch (error) {
            alert("Error generating JOIN SQL. Message = " + error);
            throw "Error generating JOIN SQL. Message = " + error;
        }

        hds_table_name = $('#hds_table_name').val().replace(/ /g, "_").toUpperCase();
        if (hds_table_name == '') {
            alert("HDS Table Name cannot be empty");
            throw "HDS Table Name cannot be empty";
        }

        is_append_task = $('#task_append').is(':checked');
        hds_sql = gen_hds_sql(hds_table_name, key_info, is_append_task);

        hds_columns = gen_hds_columns(key_info);

        update_db1_info();
        update_db2_info();

        db1_namemapping = gen_namemapping(1, join_pairs);
        db2_namemapping = gen_namemapping(2, join_pairs);

        task_info = gen_task_info(
            db1_type, db1_ip, db1_port, db1_username, db1_password, db1_dbname, db1_tblname, db1_keylist, db1_namemapping, db1_starttime, db1_endtime,
            db2_type, db2_ip, db2_port, db2_username, db2_password, db2_dbname, db2_tblname, db2_keylist, db2_namemapping, db2_starttime, db2_endtime,
            join_sql,
            hds_sql, hds_table_name, hds_columns
        );

        $('#db1_genres').text(JSON.stringify(task_info['db'][0]['sql']));
        $('#db2_genres').text(JSON.stringify(task_info['db'][1]['sql']));
        $('#join_genres').text(join_sql);
        $("#hds_genres").text(hds_sql);

        if (db2_type == 'none') {
            delete task_info['db'].pop();
        }
        is_phoenix = $('#task_to').is(':checked').toString();
        try {
            task_dict = JSON.parse($('#task_info').text());
        }
        catch (e) {
            // this is the first task
            task_id = _uuid();
            $("#sent_task_id").text('task_id = ' + task_id);
            task_dict = {
                'task_id': task_id,
                'phoenix': is_phoenix,
                'task_list': []
            }

            // lock left table to Dataframe
            {
                $('#db1_list').children().eq(0).text('Dataframe');
                $('#db1_list').val('Dataframe');
                $('#db1_list').prop('disabled', true);
            }
        }
        task_dict['task_list'].push(task_info);
        $('#task_info').text(JSON.stringify(task_dict));

        // set #db1_key_list to Dataframe keys
        {
            children = $('#db1_key_list').children();
            for (i = 0; i < children.length; ++i) {
                children[i].remove();
            }
            last_task = task_dict['task_list'][task_dict['task_list'].length - 1];
            key_list = last_task['hds']['columns'];
            for (key in key_list) {
                opt_idx = parseInt(key) + 1
                $('#db1_key_list').append('<option value="' + opt_idx + '">' + key_list[key] + '</option>');
            }
            $('#db1_key_list').append('<option value="' + (++opt_idx) + '">' + '' + '</option>');

            while (key_table_pop())
                ;
        }
    });

    $("#send_req").click(function() {
        queue = 'task_req'
        msg = encodeURI($('#task_info').val());
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

    $("#task_append").change(function() {
        let checked = this.checked;
        var textareaobj = $('textarea#hds_table_name');
        var selectobj   = $('select#__hds_table_name');
        if (checked) {
            textareaobj.hide();
            selectobj.show();

            args = 'ip=hbase-master';
            args += '&port=8765';
            args += '&cached=';
            $.ajax({
                "type": "GET",
                "dataType": "json",
                "contentType": "application/json",
                "url": flask_http_url+'/phoenix/listtables?' + args,
                "timeout": 30000,
                success: function(result) {
                    // clear original options
                    children = selectobj.children();
                    for (i = 0; i < children.length; ++i) {
                        children[i].remove();
                    }

                    key_list = result['table_list'];
                    for (key in key_list) {
                        opt_idx = parseInt(key) + 1
                        selectobj.append('<option value="' + opt_idx + '">' + key_list[key] + '</option>');
                    }

                    textareaobj.text($('select#__hds_table_name option:selected').text());
                },
                error: function(jqXHR, JQueryXHR, textStatus) {
                    alert("Failed to connect to HDS");
                }
            });
        }
        else {
            textareaobj.show();
            selectobj.hide();
        }
    });

    $("#__hds_table_name").change(function() {
        var textareaobj = $('textarea#hds_table_name');
        textareaobj.text($('select#__hds_table_name option:selected').text());
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

    db1_keylist = [];
    join_pairs = get_joining_pairs();
    for (i = 0; i < join_pairs.length; ++i) {
        if (join_pairs[i]['leftkey'] != '')
            db1_keylist.push(join_pairs[i]['leftkey']);
    }
    if ($('#datetimepicker_start').find('input').val()=="" || $('#datetimepicker_end').find('input').val()==""){
        db1_starttime = "";
        db1_endtime = "";
    }else{
        db1_starttime = $('#datetimepicker_start').find('input').val().replace(" ","T") + ":00";
        db1_endtime = $('#datetimepicker_end').find('input').val().replace(" ","T") + ":00";
        //time_val = $('#datetimepicker_start').data('datetimepicker').getDate();
        //db1_starttime = time_val.getFullYear() + "-" + (time_val.getMonth()+1) + "-" + time_val.getDate() + "T" + time_val.getHours() + ":" + time_val.getMinutes() + ":00.000Z"; //The value of second is default set to "00"
        //time_val = $('#datetimepicker_end').data('datetimepicker').getDate();
        //db1_endtime = time_val.getFullYear() + "-" + (time_val.getMonth()+1) + "-" + time_val.getDate() + "T" + time_val.getHours() + ":" + time_val.getMinutes() + ":00.000Z"; //The value of second is default set to "00"    
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

    db2_keylist = [];
    join_pairs = get_joining_pairs();
    for (i = 0; i < join_pairs.length; ++i) {
        if (join_pairs[i]['rightkey'] != '')
            db2_keylist.push(join_pairs[i]['rightkey']);
    }
    if ($('#datetimepicker_start2').find('input').val()=="" || $('#datetimepicker_end2').find('input').val()==""){
        db2_starttime = "";
        db2_endtime = "";
    }else{
        db2_starttime = $('#datetimepicker_start2').find('input').val().replace(" ","T") + ":00";
        db2_endtime = $('#datetimepicker_end2').find('input').val().replace(" ","T") + ":00";
        //time_val_2 = $('#datetimepicker_start2').data('datetimepicker').getDate();
        //db2_starttime = time_val_2.getFullYear() + "-" + (time_val_2.getMonth()+1) + "-" + time_val_2.getDate() + "T" + time_val_2.getHours() + ":" + time_val_2.getMinutes() + ":00"; //The value of second is default set to "00"
        //time_val_2 = $('#datetimepicker_end2').data('datetimepicker').getDate();
        //db2_endtime = time_val_2.getFullYear() + "-" + (time_val_2.getMonth()+1) + "-" + time_val_2.getDate() + "T" + time_val_2.getHours() + ":" + time_val_2.getMinutes() + ":00"; //The value of second is default set to "00"    
    }
}

function get_joining_pairs()
{
    pairs = [];

    tr_list = $('#key_table tbody>tr');
    for (i = 0; i < tr_list.length; ++i) {
        tr = tr_list.eq(i);

        idx      = tr.children().eq(0).text();
        leftkey  = tr.children().eq(1).text();
        rightkey = tr.children().eq(2).text();

        pairs.push({
            "idx" : idx,
            "leftkey" : leftkey,
            "rightkey" : rightkey,
        });
    }
    
    return pairs;
}

function to_formatted_key(key)
{
    return key.replace(/[:.]/g, "_").replace(/[@]/g, "").toUpperCase();
}

function gen_namemapping(db_id, join_pairs)
{
    namemapping = {}

    for (i = 0; i < join_pairs.length; ++i) {
        leftkey  = join_pairs[i]['leftkey'];
        rightkey = join_pairs[i]['rightkey'];
        if (db_id == 1 && leftkey != '') {
            namemapping[leftkey] = to_formatted_key(leftkey);
        }
        else if (db_id == 2 && rightkey != '') {
            if (leftkey == '') {
                namemapping[rightkey] = to_formatted_key(rightkey);
            }
            else {
                namemapping[rightkey] = to_formatted_key(leftkey);
            }
        }
    }

    return namemapping;
}

function sql_gen_join(join_pairs) {
    /* df0 is the table of db1 */
    /* df1 is the table of db2 */

    sql = 'SELECT ';
    var key_array = []
    for (i = 0; i < join_pairs.length; ++i) {
        idx      = join_pairs[i]['idx'];
        leftkey  = to_formatted_key(join_pairs[i]['leftkey']);
        rightkey = to_formatted_key(join_pairs[i]['rightkey']);

        if (leftkey == '' && rightkey == '') {
            alert("Left key & Right key cannot be both empty");
            throw "Left key & Right key cannot be both empty";
        }
        else if (leftkey != '' && rightkey == '') {
            sql += 'df0.' + leftkey + ' as ' ;
            var new_key = '';
            new_key = to_formatted_key(leftkey)
            if(key_array.includes(new_key)){
                var inc = 1;
                while(key_array.includes(new_key = to_formatted_key(leftkey) + inc.toString())){
                    inc += 1;
                }
            }
            sql += new_key + ', ';
            key_array.push(leftkey);
        }
        else if (leftkey == '' && rightkey != ''){
            sql += 'df1.' + rightkey + ' as '
            var new_key = '';
            new_key = to_formatted_key(rightkey)
            if(key_array.includes(new_key)){
                var inc = 1;
                while(key_array.includes(new_key = to_formatted_key(rightkey) + inc.toString())){
                    inc += 1;
                }
            }
            sql += new_key + ', ';
            key_array.push(rightkey);
        }
        else if (leftkey != '' && rightkey != ''){
            sql += 'COALESCE(df0.' + leftkey + ', df1.' + leftkey + ') as ' + leftkey + ', ';
        }
    }

    sql = sql.substring(0, sql.lastIndexOf(', '));
    sql += ' FROM df0 LEFT JOIN df1 ON ';

    for (i = 0; i < join_pairs.length; ++i) {
        leftkey  = to_formatted_key(join_pairs[i]['leftkey']);
        rightkey = to_formatted_key(join_pairs[i]['rightkey']);

        if (leftkey != '' && rightkey != '') {
            sql += 'df0.' + leftkey + '=df1.' + leftkey + ' AND ';
        }
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

function key_table_insert(db1_key, db2_key)
{
    entry_cnt = $('#key_table tbody>tr').length;
    if (typeof(entry_cnt) == 'undefined' || entry_cnt <= 0) {
        entry_cnt = 0;
    }
    $('#key_table tbody').append(`
        <tr>
            <th scope="row">${entry_cnt+1}</th>
            <td>${db1_key}</td>
            <td>${db2_key}</td>
        </tr>`
    );
}

function key_table_pop()
{
    entry_cnt = $('#key_table tbody>tr').length;
    if (entry_cnt <= 0)
        return false;
    $('#key_table tr:last').remove();
    return true;
}
