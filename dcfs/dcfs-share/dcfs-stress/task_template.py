import json

def get_tbl_id(n_row):
    return f'r{n_row}_c10'

with open('/dcfs-share/dcfs-stress/task_template.json') as rf:
    raw_text = rf.read() \
        .replace("_TASKID_", 'stress') \
        .replace("_TBL1ID_LO_", get_tbl_id(20)) \
        .replace("_TBL1ID_HI_", get_tbl_id(20).upper()) \
        .replace("_TBL2ID_LO_", get_tbl_id(40)) \
        .replace("_TBL2ID_HI_", get_tbl_id(40).upper())
    task_info = json.loads(raw_text)
    print(task_info)