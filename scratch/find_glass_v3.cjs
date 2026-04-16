const fs = require('fs');
const filePath = "d:/zip (1)/Protego Pro Shell_ – Nivis Gear (16.04.2026 17：51：47).html";
const content = fs.readFileSync(filePath, 'utf-8');

// Find all matches of ADD TO CART
const matches = [...content.matchAll(/ADD TO CART/g)];
console.log(`Found ${matches.length} ADD TO CART buttons.`);

matches.forEach((m, idx) => {
    // Look at 5000 characters around each button
    const start = Math.max(0, m.index - 2500);
    const end = Math.min(content.length, m.index + 2500);
    const context = content.substring(start, end);
    
    // Check for backdrop-filter or blur
    const filter = context.match(/backdrop-filter:[^;\}]+/);
    if (filter) {
        console.log(`\n--- Button ${idx+1} Context (Filter Found!) ---`);
        console.log(`Filter: ${filter[0]}`);
        // Find the container class
        const container = context.match(/class=['\"][^'\"]*(?:fixed|sticky)[^'\"]*['\"]/);
        if (container) console.log(`Container: ${container[0]}`);
    }
});
