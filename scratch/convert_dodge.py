import pandas as pd
import json
import os

excel_path = r'c:\Users\jpvasa\Downloads\Antigravity IndianSales\assets\Dodge products list.xlsx'
output_path = r'c:\Users\jpvasa\Downloads\Antigravity IndianSales\data\dodge_bearings.json'

df = pd.read_excel(excel_path)

# Map columns
# Excel Columns: ['Sr No.', 'Part Number', 'Product Name', 'Brand', 'Product Type', 'Bore Diameter (mm)', 'Outside Diameter (mm)', 'Width (mm)', 'Dynamic Load Rating (kN)', 'Static Load Rating (kN)', 'Mass / Weight (kg)']
mapping = {
    'Part Number': 'partNo',
    'Bore Diameter (mm)': 'bore',
    'Outside Diameter (mm)': 'od',
    'Width (mm)': 'width',
    'Dynamic Load Rating (kN)': 'cLoad',
    'Static Load Rating (kN)': 'c0Load',
    'Mass / Weight (kg)': 'weight',
    'Product Type': 'type'
}

products = []
seen_part_numbers = set()
duplicates = []

for _, row in df.iterrows():
    part_no = str(row['Part Number']).strip()
    if part_no in seen_part_numbers:
        duplicates.append(part_no)
        continue
    
    seen_part_numbers.add(part_no)
    
    product = {
        'partNo': part_no,
        'bore': row['Bore Diameter (mm)'],
        'od': row['Outside Diameter (mm)'],
        'width': row['Width (mm)'],
        'cLoad': row['Dynamic Load Rating (kN)'],
        'c0Load': row['Static Load Rating (kN)'],
        'weight': row['Mass / Weight (kg)'],
        'type': row['Product Type'] if pd.notna(row['Product Type']) else 'Dodge Bearing',
        'brand': 'Dodge'
    }
    # Clean up NaNs
    for key in product:
        if pd.isna(product[key]):
            product[key] = '-'
            
    products.append(product)

with open(output_path, 'w') as f:
    json.dump(products, f, indent=4)

print(f"Total Dodge products added: {len(products)}")
print(f"Skipped duplicates: {len(duplicates)}")
if duplicates:
    print("Duplicate Part Numbers:", duplicates)
