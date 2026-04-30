import json
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

with open('notebook01cca720e3.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

print(f"Total cells: {len(nb['cells'])}\n")

# Print all code cells
for i, cell in enumerate(nb['cells']):
    if cell['cell_type'] == 'code':
        source = ''.join(cell['source'])
        print(f"=== Cell {i} (code) ===")
        print(source)
        print("\n")
