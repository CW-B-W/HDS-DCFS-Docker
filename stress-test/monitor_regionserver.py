import psutil
from datetime import time
import time
import json

proc_list = []

def update_proc():
    global proc_list
    proc_list = []
    for process in psutil.process_iter():
        cmdline = process.cmdline()
        if '-Dproc_regionserver' in cmdline:
            proc_list.append(process)

with open('regionserver_usage.log', 'w') as wf:
    while True:
        update_proc()
        if len(proc_list) < 1:
            wf.write("No process!")
            wf.write('\n')
        else:
            for proc in proc_list:
                # pmem(rss=633831424, vms=13951238144, shared=34603008, text=4096, lib=0, data=1533939712, dirty=0)
                try:
                    memory_info = proc.memory_info()
                    mem_info = {
                        'pid' : proc.pid,
                        'timestamp': time.time(),
                        'rss' : memory_info.rss,
                        'vms' : memory_info.vms,
                        'shared' : memory_info.shared,
                        'text' : memory_info.text,
                        'lib' : memory_info.lib,
                        'data' : memory_info.data,
                        'dirty' : memory_info.dirty
                    }
                except Exception as e:
                    print(str(e))
                    mem_info = {
                        'pid' : -1,
                        'timestamp': time.time(),
                        'rss' : -1,
                        'vms' : -1,
                        'shared' : -1,
                        'text' : -1,
                        'lib' : -1,
                        'data' : -1,
                        'dirty' : -1
                    }

                wf.write(json.dumps(mem_info))
                wf.write('\n')

        wf.write('\n')
        wf.flush()
        time.sleep(0.5)
