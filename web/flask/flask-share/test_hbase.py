import happybase
from pandas import DataFrame

# 連線
connection = happybase.Connection('192.168.103.52')

print("Table:")
for x in connection.tables():
    print(x.decode("utf-8"))
print("")

# table = happybase.Table("SYSTEM.CATALOG",connection)
table = happybase.Table("score",connection)

# rowkey
# https://github.com/python-happybase/happybase/issues/12
print("RowKey:")
for key, value in table.scan(filter=b'KeyOnlyFilter() AND FirstKeyOnlyFilter()') :
    print(key.decode("utf-8"))
print("")

# Column Family
# https://www.twblogs.net/a/5c35ece4bd9eee35b3a56e25/?lang=zh-cn
print("Column Family:")
column_families = table.families()
print(column_families)
for key in column_families.keys():
    print(key.decode("utf-8"))
print("")

# Column Qualifiers
print("Column Qualifiers:")
qualifiersSet = set()# 建立空的集合
for keyx, valuex in table.scan():
    for keyy,valuey in valuex.items():
        qualifiersSet.add(keyy.decode("utf-8").split(":")[1])

for val in qualifiersSet:
    print(val)
print("")

# Column Qualifiers
print("Column Family & Column Qualifiers:")
qualifiersSet = set()# 建立空的集合
for keyx, valuex in table.scan():
    for keyy,valuey in valuex.items():
        qualifiersSet.add(keyy.decode("utf-8"))
keylist = sorted(qualifiersSet)
print(keylist)

for val in keylist:
    print(val)
print("")

data = table.scan(columns = [b'midterm:Math', b'final:Math'])
# for rowkey, entry in data:
#     print(f"rowkey: {rowkey}")
#     for item in entry:
#         print(f"item: {item}")

my_generator = ((d[b'midterm:Math'], d[b'final:Math']) for k, d in data)
my_list = list(my_generator)
print(my_list)
my_data = DataFrame(my_list, columns=['midterm:Math', 'final:Math'])
print(my_data)