const fs = require('fs');
const content = fs.readFileSync('e:\\demoNongsanproject\\frontend\\src\\FigmaApp.jsx', 'utf8');

const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('useState') || line.includes(':') && (line.includes('=>') || line.includes('function'))) {
    console.log(`Line ${i+1}: ${line.trim()}`);
  }
});
