import phoenixdb
import phoenixdb.cursor

def phoenix_list_all_tables(ip, port='8765'):
    conn = phoenixdb.connect('http://%s:%s' % (ip, port))
    cursor = conn.cursor(cursor_factory=phoenixdb.cursor.DictCursor)
    cursor.execute("select DISTINCT(\"TABLE_NAME\") from SYSTEM.CATALOG")
    res = cursor.fetchall()
    l = [item['TABLE_NAME'] for item in res]
    return l

def phoenix_list_all_keys(table_name, ip, port='8765'):
    conn = phoenixdb.connect('http://%s:%s' % (ip, port))
    cursor = conn.cursor(cursor_factory=phoenixdb.cursor.DictCursor)
    cursor.execute("SELECT column_name FROM system.catalog WHERE table_name = '%s' AND column_name IS NOT NULL" % table_name)
    res = cursor.fetchall()
    l = [item['COLUMN_NAME'] for item in res]
    return l

def phoenix_list_all_types(table_name, ip, port='8765'):
    TYPE_MAP = {
        4  : 'INTEGER',
        -5 : 'BIGINT',
        -6 : 'TINYINT',
        5  : 'SMALLINT',
        6  : 'FLOAT',
        8  : 'DOUBLE',
        3  : 'DECIMAL',
        16 : 'BOOLEAN',
        92 : 'TIME',
        91 : 'DATE',
        93 : 'TIMESTAMP',
        12 : 'VARCHAR',
        1  : 'CHAR',
        -2 : 'BINARY',
        -3 : 'VARBINARY'
    }
    conn = phoenixdb.connect('http://%s:%s' % (ip, port))
    cursor = conn.cursor(cursor_factory=phoenixdb.cursor.DictCursor)
    cursor.execute("SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, KEY_SEQ FROM system.catalog WHERE TABLE_NAME = '%s' AND COLUMN_NAME IS NOT NULL" % table_name)
    res = cursor.fetchall()
    d = {}
    for item in res:
        d[item['COLUMN_NAME']] = TYPE_MAP[item['DATA_TYPE']]
    return d

print(phoenix_list_all_tables("hbase-master"))
print(phoenix_list_all_keys("MSSQLSINGLE", "hbase-master"))
print(phoenix_list_all_types("MSSQLSINGLE", "hbase-master"))