import re
import os

file_path = "d:/zip (1)/Protego Pro Shell_ – Nivis Gear (16.04.2026 17：51：47).html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find occurrences of "ADD TO CART"
matches = list(re.finditer(r"ADD TO CART", content))
print(f"Found {len(matches)} occurrences of 'ADD TO CART'")

for i, match in enumerate(matches):
    start = max(0, match.start() - 500)
    end = min(len(content), match.end() + 500)
    snippet = content[start:end]
    print(f"\n--- Snippet {i+1} ---")
    print(snippet)

# Also search for backdrop-filter occurrences
filters = list(re.finditer(r"backdrop-filter:[^;\}]+", content))
print(f"\nFound {len(filters)} occurrences of 'backdrop-filter'")
for i, f_match in enumerate(filters):
    print(f"Filter {i+1}: {f_match.group(0)}")
    # Print context
    s = max(0, f_match.start() - 100)
    e = min(len(content), f_match.end() + 100)
    print(f"Context: {content[s:e]}\n")
