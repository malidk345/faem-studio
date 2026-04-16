const fs = require('fs');
const filePath = "d:/zip (1)/Protego Pro Shell_ – Nivis Gear (16.04.2026 17：51：47).html";
const content = fs.readFileSync(filePath, 'utf-8');

const matches = [...content.matchAll(/ADD TO CART/g)];
console.log(`Found ${matches.length} occurrences of 'ADD TO CART'`);

const filters = [...content.matchAll(/backdrop-filter:[^;\}]+/g)];
console.log(`\nFound ${filters.length} occurrences of 'backdrop-filter'`);
filters.forEach((f_match, i) => {
    console.log(`\nFilter ${i+1}: ${f_match[0]}`);
    const s = Math.max(0, f_match.index - 500);
    const e = Math.min(content.length, f_match.index + 500);
    console.log(`Context: ${content.substring(s, e)}`);
});
