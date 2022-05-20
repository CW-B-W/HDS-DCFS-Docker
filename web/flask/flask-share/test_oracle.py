import pandas as pd
from pandasql import sqldf
from sqlalchemy import create_engine


db1_engine = create_engine(r"oracle+cx_oracle://brad:00000000@192.168.103.60:1521/?service_name=XEPDB1")
df1 = pd.read_sql("SELECT 'Hello World!' FROM dual", con=db1_engine)
print(df1)