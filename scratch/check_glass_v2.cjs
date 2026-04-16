const fs = require('fs');
const filePath = "d:/zip (1)/Protego Pro Shell_ – Nivis Gear (16.04.2026 17：51：47).html";
const content = fs.readFileSync(filePath, 'utf-8');

const regex = /<button[^>]*ADD TO CART[^]*?<\/button>/gi;
const matches = [...content.matchAll(regex)];

matches.forEach((match, i) => {
    // Find the starting position of the match
    const matchIdx = match.index;
    // Walk backwards to find parent containers (not a full parser but good enough)
    const context = content.substring(Math.max(0, matchIdx - 2000), matchIdx);
    console.log(`\n--- Button ${i+1} ---`);
    console.log(context.substring(context.lastIndexOf('<div'))); // Show last div start
    // Find any backdrop-filter in the preceding 2000 chars
    const hasFilter = context.match(/backdrop-filter:[^;\}]+/);
    if (hasFilter) {
        console.log(`FOUND FILTER: ${hasFilter[0]}`);
    }
});
