import json

def get_tbl_id(n_row):
    return f'r{n_row}_c10'

def gen_task_info(tbl1_n_row, tbl2_n_row):
    with open('/dcfs-share/dcfs-stress/task_template.json') as rf:
        raw_text = rf.read() \
            .replace("_TASKID_", 'stress') \
            .replace("_TBL1ID_LO_", get_tbl_id(tbl1_n_row)) \
            .replace("_TBL1ID_HI_", get_tbl_id(tbl1_n_row).upper()) \
            .replace("_TBL2ID_LO_", get_tbl_id(tbl2_n_row)) \
            .replace("_TBL2ID_HI_", get_tbl_id(tbl2_n_row).upper())
        task_info = json.loads(raw_text)
        return task_info

task_info = gen_task_info(20, 40)
task_id = task_info['task_id']
with open('/dcfs-share/dcfs-watch/%s.json' % task_id, 'w') as wf:
    wf.write(json.dumps(task_info))