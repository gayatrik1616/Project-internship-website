import pandas as pd
import json
import os

file_path = r'c:\Users\jpvasa\Downloads\Antigravity IndianSales\assets\Dodge products list.xlsx'
df = pd.read_excel(file_path)

print("Columns:", df.columns.tolist())
print("First 5 rows:")
print(df.head())
