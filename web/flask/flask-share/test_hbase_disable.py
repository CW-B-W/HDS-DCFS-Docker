import happybase
from pandas import DataFrame

# 連線
connection = happybase.Connection('hbase-master')

# for x in connection.tables():
#     print(x.decode("utf-8"))

for x in connection.tables():
    tbl_name = x.decode("utf-8")
    if tbl_name.find("STRESS") != -1:
        if connection.is_table_enabled(tbl_name) == True:
            connection.disable_table(tbl_name)
            print(f"Disable table {tbl_name}")