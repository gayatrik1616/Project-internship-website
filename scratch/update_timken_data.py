import json

# Paths
EXTRACTED_JSON = r'c:\Users\jpvasa\Desktop\TIMKEN\extracted_specs.json'
OUTPUT_JSON = r'c:\Users\jpvasa\Downloads\Antigravity IndianSales\data\timken_bearings.json'

def parse_tapered(parts):
    # Bore OD Width C1 e Y C90 Ca90 K C0 Cup Cone
    # 15.875 49.225 23.020 42800 0.27 2.26 11100 5050 2.20 40500 09062 09194
    if len(parts) >= 12:
        return {
            "bore": parts[0],
            "od": parts[1],
            "width": parts[2],
            "cLoad": parts[3],
            "c0Load": parts[9],
            "weight": "-",
            "type": "Timken Tapered Roller Bearing"
        }
    return None

def parse_ball(parts):
    # Bore OD Width C C0 Weight PartNo
    # 50.00 80.00 10.00 15400 11700 0.18 16010
    if len(parts) >= 6:
        return {
            "bore": parts[0],
            "od": parts[1],
            "width": parts[2],
            "cLoad": parts[3],
            "c0Load": parts[4],
            "weight": parts[5] if len(parts) > 5 else "-",
            "type": "Timken Ball Bearing"
        }
    return None

with open(EXTRACTED_JSON, 'r') as f:
    raw_data = json.load(f)

bearings = []
for part_no, info in raw_data.items():
    parts = info["RawLine"].split()
    parsed = None
    
    if info["Catalog"] == "Tapered":
        parsed = parse_tapered(parts)
    elif info["Catalog"] == "Ball":
        parsed = parse_ball(parts)
        
    if parsed:
        parsed["partNo"] = part_no
        parsed["brand"] = "Timken"
        bearings.append(parsed)

with open(OUTPUT_JSON, 'w') as f:
    json.dump(bearings, f, indent=4)

print(f"Total Timken products integrated: {len(bearings)}")
