import json
import re

def parse_tapered_line(line):
    # Example: 12.700 38.100 13.495 20900 0.28 2.18 5410 2550 2.12 17100 00050 00150
    # Parts: [0]Bore, [1]OD, [2]Width, [3]C1, [4]e, [5]Y, [6]C90, [7]Ca90, [8]K, [9]C0
    parts = line.split()
    if len(parts) >= 10:
        try:
            return {
                "bore": parts[0],
                "od": parts[1],
                "width": parts[2],
                "cLoad": parts[3],
                "c0Load": parts[9] if len(parts) >= 10 else "-",
                "weight": parts[13] if len(parts) >= 15 else "-" # Some lines have mass at index 13
            }
        except:
            pass
    return None

def main():
    input_file = r'c:\Users\jpvasa\Desktop\TIMKEN\extracted_specs.json'
    output_file = r'c:\Users\jpvasa\Downloads\Antigravity IndianSales\data\timken_bearings.json'
    
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    timken_products = []
    for part, info in data.items():
        if info["Catalog"] == "Tapered":
            specs = parse_tapered_line(info["RawLine"])
            if specs:
                specs["partNo"] = part
                specs["type"] = "Tapered Roller Bearing"
                timken_products.append(specs)
    
    with open(output_file, 'w') as f:
        json.dump(timken_products, f, indent=4)
    
    print(f"Processed {len(timken_products)} Timken products.")

if __name__ == "__main__":
    main()
