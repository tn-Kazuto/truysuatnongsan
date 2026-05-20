const fs = require('fs');
const content = fs.readFileSync('C:\\Users\\Admin\\.gemini\\antigravity\\brain\\e02f5bed-5e0e-4406-9cca-3d0f57482cc3\\.tempmediaStorage\\dom_1779200495973.txt', 'utf8');

const lines = content.split('\n');
const line6 = lines[5]; // 0-indexed index 5 is line 6
console.log('Line 6 length:', line6.length);
console.log('Line 6 start:', line6.substring(0, 200));
console.log('Line 6 end:', line6.substring(line6.length - 200));
