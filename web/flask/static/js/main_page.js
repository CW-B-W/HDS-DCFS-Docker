// $(document).ready(function() {
//     /* =================== GenTask =================== */

//     // function import_gen_task_info(
//     //     task_id,
//     //     username, password, ip, port,
//     //     db_name, sql,
//     //     hds_sql, hds_table, hds_columns
//     // ){
//     //     task_info = {
//     //         'task_id': task_id,
//     //         'db': [
//     //             {
//     //                 'type': $('#dblist').val().toLowerCase(),
//     //                 'username': username,
//     //                 'password': password,
//     //                 'ip': ip,
//     //                 'port': port,
//     //                 'db': db_name,
//     //                 'sql': sql
//     //             },
//     //         ],
//     //         'hds': {
//     //             'sql': hds_sql,        // the sql to create table
//     //             'table': hds_table,
//     //             'columns': hds_columns // the column names in table (ordered)
//     //         }
//     //     };

//     //     return task_info;
//     // }
//     // function import_gen_task_info_2(
//     //     task_id,
//     //     username, password, ip, port,
//     //     db_name, mongodb_table_name,mongodb_filter,
//     //     hds_sql, hds_table, hds_columns
//     // ){
//     //     task_info = {
//     //         'task_id': task_id,
//     //         'db': [
//     //             {
//     //                 'type': 'mongodb',
//     //                 'username': username,
//     //                 'password': password,
//     //                 'ip': ip,
//     //                 'port': port,
//     //                 'db': db_name,
//     //                 'table': mongodb_table_name,
//     //                 'filter': mongodb_filter
//     //             },
//     //         ],
//     //         'hds': {
//     //             'sql': hds_sql,        // the sql to create table
//     //             'table': hds_table,
//     //             'columns': hds_columns // the column names in table (ordered)
//     //         }
//     //     };

//     //     return task_info;
//     // }

//     /* =================== GenTask =================== */



//     /* ==================== HDS  ====================== */
    
    
    
//     /* ==================== HDS  ====================== */

//     /* ================== SendTask ==================== */
    

//     /*========= send import request ===========*/
//     $("#import_send_req").click(function() {
//         task_id = _uuid();
//         $("#import_sent_task_id").text('task_id = ' + task_id);

//         key_info = {}
//         primary_key = $('input[name=flexRadioDefault]:checked', '#import_col_opt_list').val();
//         l = $("select[id^=typeopt_]");
//         for (i = 0; i < l.length; ++i) {
//             key = l.eq(i).attr('id').substring('typeopt_'.length);
//             opt = l.eq(i).val();
//             key_info[key] = {
//                 'key': key,
//                 'type': opt,
//                 'is_primary': primary_key == key
//             }
//         }
        
//         hds_sql     = import_gen_hds_sql(key_info);
//         hds_table   = $('#import_hds_table_name').val().replace(/ /g,"_");
//         hds_columns = gen_hds_columns(key_info);

//         $("#import_hds_genres").text(hds_sql);

//         if((($("#dblist").val() != "MongoDB"))){
//             task_info = import_gen_task_info(
//                 task_id,
//                 username, password, ip, port, 
//                 db_name, import_sql,
//                 hds_sql, hds_table, hds_columns
//                 );
//                 $('#import_task_info').text(JSON.stringify(task_info));
//         }else{
//             task_info = import_gen_task_info_2(
//             task_id,
//             username, password, ip, port,
//             db_name, tbl_name, mongodb_filter,
//             hds_sql, hds_table, hds_columns
//             );
//             $('#import_task_info').text(JSON.stringify(task_info));
//         }
        


//         queue = 'task_req'
//         msg   = encodeURI($('#import_task_info').text());
//         $.ajax({
//             "type": "POST",
//             "xhrFields": {
//                 "withCredentials": true
//             },
//             "dataType": "json",
//             "contentType": "application/json",
//             "url": "http://192.168.103.52:15672/api/exchanges/%2F/amq.default/publish", 
//             "data": '{"vhost":"/","name":"amq.default","properties":{"delivery_mode":1,"headers":{}},"routing_key":"'+queue+'","delivery_mode":"1","payload":"'+msg+'","headers":{},"props":{},"payload_encoding":"string"}',
//             success: function(result) {
//                 alert("Message sent");
//             },
//             error: function(jqXHR, JQueryXHR, textStatus) {
//                 alert("Error sending message to MQ");
//             }
//         });
//     });
//     /*========= send import request ===========*/

//     /* ================== SendTask ==================== */



    

//     /* ================= data import ================= */
    
    
//     // $("#import_db_list").change(function() {
//     //     /* ==================== MySQL & MsSQL & Oracle & cassandra ==================== */
//     //     if(  ($("#dblist").val() != "MongoDB") ){
//     //         database = $("#dblist").val().toLowerCase();
//     //         username = $('#username').val();
//     //         password = $('#password').val();
//     //         ip_port = $('#server').val().split(':');
//     //         ip = ip_port[0]
//     //         port = ip_port[1]
//     //         args = 'username=' + username;
//     //         args += '&password=' + password;
//     //         args += '&ip=' + ip;
//     //         args += '&port=' + port;

//     //         sel_idx = $(this)[0].selectedIndex;
//     //         if (sel_idx != 0) {
//     //             db_name = $(this).children().eq(sel_idx).text();
//     //             args += '&db_name=' + db_name;
//     //             $.ajax({
//     //                 "type": "GET",
//     //                 "dataType": "json",
//     //                 "contentType": "application/json",
//     //                 "url": flask_http_url+"/" +database+ '/listtables?' + args,
//     //                 "timeout": 30000,
//     //                 success: function(result) {
//     //                     // clear original options
//     //                     children = $('#import_table_list').children();
//     //                     for (i = 1; i < children.length; ++i) {
//     //                         children[i].remove();
//     //                     }
//     //                     $('#import_table_list')[0].selectedIndex = 0;

//     //                     table_list = result['table_list'];
//     //                     for (key in table_list) {
//     //                         opt_idx = parseInt(key) + 1
//     //                         $('#import_table_list').append('<option value="' + opt_idx + '">' + table_list[key] + '</option>');

//     //                     }
//     //                 },
//     //                 error: function(jqXHR, JQueryXHR, textStatus) {
//     //                     $("#import_status").text("Connect failed");
//     //                 }
//     //             });
//     //         } else {
//     //             children = $('#import_table_list').children();
//     //             for (i = 1; i < children.length; ++i) {
//     //                 children[i].remove();
//     //             }
//     //             $('#import_table_list')[0].selectedIndex = 0;
//     //         }
//     //         /* ==================== MySQL & MsSQL & Oracle & cassandra==================== */
//     //     }else{
//     //         /* =================== MongoDB =================== */
//     //         sel_idx = $(this)[0].selectedIndex;
//     //         if (sel_idx != 0) {
//     //             db_name = $(this).children().eq(sel_idx).text();
//     //             $.ajax({
//     //                 "type": "GET",
//     //                 "dataType": "json",
//     //                 "contentType": "application/json",
//     //                 "url": flask_http_url+"/"+'mongodb/listtables?db_name=' + db_name,
//     //                 "timeout": 30000,
//     //                 success: function(result) {
//     //                     // clear original options
//     //                     children = $('#import_table_list').children();
//     //                     for (i = 1; i < children.length; ++i) {
//     //                         children[i].remove();
//     //                     }
//     //                     $('#import_table_list')[0].selectedIndex = 0;
    
//     //                     table_list = result['table_list'];
//     //                     for (key in table_list) {
//     //                         opt_idx = parseInt(key) + 1
//     //                         $('#import_table_list').append('<option value="' + opt_idx + '">' + table_list[key] + '</option>');
    
//     //                     }
//     //                 },
//     //                 error: function(jqXHR, JQueryXHR, textStatus) {
//     //                     $("#import_status").text("Connect failed");
//     //                 }
//     //             });
//     //         } else {
//     //             children = $('#import_table_list').children();
//     //             for (i = 1; i < children.length; ++i) {
//     //                 children[i].remove();
//     //             }
//     //             $('#import_table_list')[0].selectedIndex = 0;
//     //         }
//     //     }
//     //     /* =================== MongoDB =================== */
//     // });
//     // $("#import_table_list").change(function() {
//     //     /* ==================== MySQL & MsSQL & Oracle & cassandra==================== */
//     //     if(  ($("#dblist").val() != "MongoDB") ){
//     //         database = $("#dblist").val().toLowerCase();
//     //         username = $('#username').val();
//     //         password = $('#password').val();
//     //         ip_port = $('#server').val().split(':');
//     //         ip = ip_port[0]
//     //         port = ip_port[1]
//     //         args = 'username=' + username;
//     //         args += '&password=' + password;
//     //         args += '&ip=' + ip;
//     //         args += '&port=' + port;

//     //         db_sel_idx = $("#import_db_list")[0].selectedIndex;
//     //         tbl_sel_idx = $(this)[0].selectedIndex;
//     //         if (tbl_sel_idx != 0) {
//     //             db_name = $("#import_db_list").children().eq(db_sel_idx).text();
//     //             tbl_name = $(this).children().eq(tbl_sel_idx).text();
//     //             args += '&db_name=' + db_name;
//     //             args += '&table_name=' + tbl_name;
//     //             $.ajax({
//     //                 "type": "GET",
//     //                 "dataType": "json",
//     //                 "contentType": "application/json",
//     //                 "url": flask_http_url+"/" +database+ '/listkeys?' + args,
//     //                 "timeout": 30000,
//     //                 success: function(result) {
//     //                     // clear original options
//     //                     children = $('#import_key_list').children();
//     //                     for (i = 0; i < children.length; ++i) {
//     //                         children[i].remove();
//     //                     }

//     //                     key_list = result['key_list'];
//     //                     for (key in key_list) {
//     //                         opt_idx = parseInt(key) + 1
//     //                         $('#import_key_list').append('<option value="' + opt_idx + '">' + key_list[key] + '</option>');
//     //                     }
//     //                 },
//     //                 error: function(jqXHR, JQueryXHR, textStatus) {
//     //                     $("#import_status").text("Connect failed");
//     //                 }
//     //             });
//     //         } else {
//     //             children = $('#import_key_list').children();
//     //             for (i = 0; i < children.length; ++i) {
//     //                 children[i].remove();
//     //             }
//     //         }
//     //     /* ==================== MySQL & MsSQL & Oracle & cassandra==================== */
//     //     }else{
//     //         /* =================== MongoDB =================== */
//     //         db_sel_idx = $("#import_db_list")[0].selectedIndex;
//     //         tbl_sel_idx = $(this)[0].selectedIndex;
//     //         if (tbl_sel_idx != 0) {
//     //             db_name = $("#import_db_list").children().eq(db_sel_idx).text();
//     //             tbl_name = $(this).children().eq(tbl_sel_idx).text();
//     //             $.ajax({
//     //                 "type": "GET",
//     //                 "dataType": "json",
//     //                 "contentType": "application/json",
//     //                 "url": flask_http_url+"/"+'mongodb/listkeys?db_name=' + db_name + '&table_name=' + tbl_name,
//     //                 "timeout": 30000,
//     //                 success: function(result) {
//     //                     // clear original options
//     //                     children = $('#import_key_list').children();
//     //                     for (i = 0; i < children.length; ++i) {
//     //                         children[i].remove();
//     //                     }

//     //                     key_list = result['key_list'];
//     //                     key_list.splice(key_list.indexOf('_id'), 1);
//     //                     for (key in key_list) {
//     //                         opt_idx = parseInt(key) + 1
//     //                         $('#import_key_list').append('<option value="' + opt_idx + '">' + key_list[key] + '</option>');
//     //                     }
//     //                 },
//     //                 error: function(jqXHR, JQueryXHR, textStatus) {
//     //                     $("#import_status").text("Connect MongoDB failed");
//     //                 }
//     //             });
//     //         } else {
//     //             children = $('#import_key_list').children();
//     //             for (i = 0; i < children.length; ++i) {
//     //                 children[i].remove();
//     //             }
//     //         }
//     //         /* =================== MongoDB =================== */
//     //     }
//     // });
// //     $("#import_create_req").click(function() {
        
       
// //        username = $('#username').val();
// //        password = $('#password').val();
// //        ip_port = $('#server').val().split(':');
// //        ip = ip_port[0]
// //        port = ip_port[1]
// //        db_name = $('#import_db_list').children()
// //            .eq($('#import_db_list')[0].selectedIndex)
// //            .text();
// //        tbl_name = $('#import_table_list').children()
// //            .eq($('#import_table_list')[0].selectedIndex)
// //            .text();
// //        mysql_key_sel_idx = $('#import_key_list').val();
// //        key_names_1 = [];
// //        for (i in mysql_key_sel_idx) {
// //            key_names_1.push(
// //                $('#import_key_list').children()
// //                .eq(mysql_key_sel_idx[i] - 1).text());
// //        }
       
// //        switch($("#dblist").val()){
// //             case "MongoDB":
// //                 mongodb_filter = mongodb_gen_sql(key_names_1);
// //                 $('#import_genres').text(JSON.stringify(mongodb_filter));
// //                 break;
// //             case "Oracle":
// //                 isOracle=1;
// //                 import_sql = mysql_gen_sql(tbl_name, key_names_1,isOracle);
// //                 $('#import_genres').text(import_sql);
// //                 break;
// //             case "Cassandra":
// //                 import_sql='SELECT * FROM '+db_name+'.'+tbl_name+'';
// //                 $('#import_genres').text(import_sql);
// //                 break;
// //             case "Elasticsearch":
// //                 import_sql='SELECT * FROM '+tbl_name+'';
// //                 $('#import_genres').text(import_sql);
// //                 break;
// //             default:
// //                 isOracle=0;
// //                 import_sql = mysql_gen_sql(tbl_name, key_names_1,isOracle);
// //                 $('#import_genres').text(import_sql);
// //        }
       
// //        key_names_2=[];

// //        import_gen_col_opt_elems(key_names_1, key_names_2);
// //    });

//    function import_gen_hds_sql(key_info) {
//         key_info = sort_key_info(key_info);
//         table_name = $('#import_hds_table_name').val().replace(/ /g,"_");
//         sql = 'CREATE TABLE IF NOT EXISTS ' + table_name + ' (';
//         for (k in key_info) {
//             if (key_info[k]['is_primary']) {
//                 sql += k + ' ' + key_info[k]['type'] + ' PRIMARY KEY, ';
//                 break;
//             }
//         }
//         for (k in key_info) {
//             if (!key_info[k]['is_primary']) {
//                 sql += k + ' ' + key_info[k]['type'] + ', ';
//             }
//         }
//         sql = sql.substring(0, sql.length-2);
//         sql += ');';
//         return sql;
//     }

   
// });