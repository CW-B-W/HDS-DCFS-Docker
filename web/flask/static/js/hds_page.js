$(document).ready(function() {
    $("#conn_hds").click(function() {
        zoo_url = hds_zoo_ip + ':' + hds_zoo_port;
        $.ajax({
            "type": "GET",
            "dataType": "json",
            "contentType": "application/json",
            "url": 'http://'+$("#hds_server").val()+'/dataservice/v1/list?from=jdbc:///&info=jdbc:phoenix:' + zoo_url,
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
            zoo_url = hds_zoo_ip + ':' + hds_zoo_port;
            $.ajax({
                "type": "GET",
                "dataType": "json",
                "contentType": "application/json",
                "url": 'http://'+$("#hds_server").val()+'/dataservice/v1/list?from=jdbc:///&info=jdbc:phoenix:' + zoo_url + '&table=' + tbl_name,
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

    $('#send_hds_req').click(function() {
        zoo_url = hds_zoo_ip + ':' + hds_zoo_port;
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
        tmp_file_name = $("#download_file_name").val()+'_'+_uuid()+'.csv';
        access1 = 'http://'+$("#hds_server").val()+'/dataservice/v1/access?from=jdbc:///&info=jdbc:phoenix:'+zoo_url+'&query='+sql+'&header=true'+'&to=file:///tmp/web_download_tmp/'+tmp_file_name+'&async=true&redirectfrom=dcfs-worker1'
        access1 = encodeURI(access1)
        access2 = 'http://'+$("#hds_server").val()+'/dataservice/v1/access?from=file:///tmp/web_download_tmp/'+tmp_file_name+'&to=local:///'+$("#download_file_name").val()+'.csv'
        $.ajax({
            "type": "GET",
            "dataType": "json",
            "contentType": "application/json",
            "url": access1,
            "timeout": 30000,
            success: function(result) {
                tk_id = JSON.stringify(result['task']['id']).replace(/%/gi,"%25")
                tk_id = tk_id.replace(/"/gi,"")
                $('#hds_page_task_id').text(tk_id);
                $('#hds_rest_api').text(access1);
                $('#download_rest_api').text(access2);
                watch_api = 'http://'+$("#hds_server").val()+'/dataservice/v1/watch?id='+tk_id+''
                $('#watch_rest_api').text(watch_api);
                
            },
            error: function(jqXHR, JQueryXHR, textStatus) {
                alert("Download failed");
            }
        });
    });
});