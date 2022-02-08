#!/usr/bin/env python
import psutil
import time
import subprocess

def get_n_cbox():
    process = subprocess.Popen("ps -aux | grep ComputingBox | wc -l",
                                shell=True,
                                stdout=subprocess.PIPE,
                            )
    stdout = process.communicate()[0].decode('utf-8')
    return int((int(stdout)-2)/2)

def is_demo_running():
    process = subprocess.Popen("ps -aux | grep demo.py | wc -l",
                                shell=True,
                                stdout=subprocess.PIPE,
                            )
    stdout = process.communicate()[0].decode('utf-8')
    return int(stdout) > 2

has_demo_run = False
with open('system_usage.log', 'w') as wf:
    while True:
        wf.write(f'timestamp: {time.time()}\n')
        
        wf.write(f'# of CBox: {get_n_cbox()}\n')
        
        if is_demo_running():
            has_demo_run = True
            wf.write(f'Is demo running: True\n')
        elif has_demo_run == True:
            wf.write(f'Is demo running: False\n')
            exit(0)
        else:
            wf.write(f'Is demo running: False\n')
        
        wf.write("CPU total:\n")
        wf.write(f'{psutil.cpu_percent()}\n')
        wf.write(f'CPU per usage:\n')
        wf.write(f'{psutil.cpu_percent(percpu=True)}\n')
        
        wf.write("VMEM used:\n")
        wf.write(f'{psutil.virtual_memory().used}\n')
        
        wf.write("VMEM total:\n")
        wf.write(f'{psutil.virtual_memory().total}\n')
        
        wf.write("SWAP used:\n")
        wf.write(f'{psutil.swap_memory().used}\n')
        
        wf.write("SWAP total:\n")
        wf.write(f'{psutil.swap_memory().total}\n')
        
        wf.write('\n')
        wf.flush()
        time.sleep(0.5)