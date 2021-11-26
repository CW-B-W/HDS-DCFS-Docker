import sys
import time
# add paths, otherwise python3 launched by DCFS would go wrong
for p in ['', '/usr/lib/python36.zip', '/usr/lib/python3.6', '/usr/lib/python3.6/lib-dynload', '/home/brad/.local/lib/python3.6/site-packages', '/usr/local/lib/python3.6/dist-packages', '/usr/lib/python3/dist-packages']:
    sys.path.append(p)
import pandas as pd
from pandasql import sqldf
from sqlalchemy import create_engine


db1_engine = create_engine(r"mssql+pymssql://SA:00000000Xx@192.168.103.52:1433/HDS_TEST")
df1 = pd.read_sql("SELECT * FROM SCORE", con=db1_engine)
print(df1)

# list all databases
db1_engine = create_engine(r"mssql+pymssql://SA:00000000Xx@192.168.103.52:1433")
df1 = pd.read_sql(r"SELECT name FROM master.dbo.sysdatabases", con=db1_engine)
print(list(df1.iloc[:,0]))

# list all tables
db1_engine = create_engine(r"mssql+pymssql://SA:00000000Xx@192.168.103.52:1433/HDS_TEST")
df1 = pd.read_sql(r"SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'", con=db1_engine)
print(list(df1.iloc[:,2]))

# list all columns
df1 = pd.read_sql(r"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SCORE' ORDER BY ORDINAL_POSITION", con=db1_engine)
print(list(df1.iloc[:,0]))