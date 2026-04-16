const fs = require('fs');
const filePath = "d:/zip (1)/Protego Pro Shell_ – Nivis Gear (16.04.2026 17：51：47).html";
const content = fs.readFileSync(filePath, 'utf-8');

// Find the "ADD TO CART" button and look upwards for the first container with a class
const matches = [...content.matchAll(/ADD TO CART/g)];
console.log(`Found ${matches.length} buttons.`);

matches.forEach((match, i) => {
    const start = Math.max(0, match.index - 2000);
    const end = Math.min(content.length, match.index + 500);
    const snippet = content.substring(start, end);
    // Look for glassmorphism related classes in snippet
    if (snippet.includes('glass') || snippet.includes('blur') || snippet.includes('backdrop')) {
        console.log(`\n--- Match ${i+1} has glassmorphism! ---`);
        console.log(snippet.substring(snippet.length - 1000)); // Show last 1000 chars
    }
});
