$(document).ready(function() {
    setInterval(send_task_status_req, 2000);
});

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
        "url": flask_http_url+"/"+'taskstatus' + args,
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
            console.log("Failed to get task status");
        }
    });
}
