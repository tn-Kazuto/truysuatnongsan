const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname, 'frontend', 'src', 'App.jsx'), 'utf8');

const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('danhSach') || line.includes('taoMoi') || line.includes('capNhat')) {
    console.log(`Line ${i+1}: ${line.trim()}`);
  }
});

