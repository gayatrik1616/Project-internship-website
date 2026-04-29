import pandas as pd

file_path = r'c:\Users\jpvasa\Downloads\Antigravity IndianSales\assets\timken part no .xlsx'
try:
    df = pd.read_excel(file_path)
    print("Columns:", df.columns.tolist())
    print("First 5 rows:")
    print(df.head())
    print("Total rows:", len(df))
except Exception as e:
    print("Error:", e)
