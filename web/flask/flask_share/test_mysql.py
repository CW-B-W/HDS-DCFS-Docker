import sys
import time
# add paths, otherwise python3 launched by DCFS would go wrong
for p in ['', '/usr/lib/python36.zip', '/usr/lib/python3.6', '/usr/lib/python3.6/lib-dynload', '/home/brad/.local/lib/python3.6/site-packages', '/usr/local/lib/python3.6/dist-packages', '/usr/lib/python3/dist-packages']:
    sys.path.append(p)
import pandas as pd
from pandasql import sqldf
from sqlalchemy import create_engine


db1_engine = create_engine(r"mysql+pymysql://brad:00000000@192.168.103.52:3306/HDS_JDBC")
df1 = pd.read_sql("SELECT * FROM SCORE", con=db1_engine)
print(df1)

# list all column names of HDS_JDBC/SCORE
df_col = pd.read_sql(r"SELECT `COLUMN_NAME` FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_SCHEMA`='HDS_JDBC' AND `TABLE_NAME`='SCORE'", con=db1_engine);
print(df_col)
print(df_col['COLUMN_NAME'].tolist())

# lsit all tables
df1 = pd.read_sql("SHOW TABLES", con=db1_engine)
print(df1.iloc[:,0].tolist())

# list all databases
db1_engine = create_engine(r"mysql+pymysql://brad:00000000@192.168.103.52:3306/")
df1 = pd.read_sql("SHOW DATABASES", con=db1_engine)
print(df1.iloc[:,0].tolist())