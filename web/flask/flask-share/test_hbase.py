import happybase
from pandas import DataFrame

# 連線
connection = happybase.Connection('hbase-master')

print("Table:")
print("")
for x in connection.tables():
    print(x.decode("utf-8"))

table = happybase.Table("SYSTEM.CATALOG",connection)

# rowkey
# https://github.com/python-happybase/happybase/issues/12
print("")
print("RowKey:")
print("")
for key, value in table.scan(filter=b'KeyOnlyFilter() AND FirstKeyOnlyFilter()') :
    print(key.decode("utf-8"))

# Column Family
# https://www.twblogs.net/a/5c35ece4bd9eee35b3a56e25/?lang=zh-cn
print("")
print("Column Family:")
print("")
column_families = table.families()
for key in column_families.keys():
    print(key.decode("utf-8"))

# Column Qualifiers
print("")
print("Column Qualifiers:")
print("")
qualifiersSet = set()# 建立空的集合
for keyx, valuex in table.scan():
    #print(key,value)
    for keyy,valuey in valuex.items():
        #print(keyy,valuey)
        #print(keyy.decode("utf-8").split(":")[1])
        qualifiersSet.add(keyy.decode("utf-8").split(":")[1])

#print(qualifiersSet)
for val in qualifiersSet:
    print(val)
