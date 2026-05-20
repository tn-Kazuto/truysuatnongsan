const fs = require('fs');
const filePath = 'e:\\demoNongsanproject\\frontend\\src\\FigmaApp.jsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/\(activity:\s*FieldActivity,\s*index:\s*number\)/g, '(activity, index)');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleaned line 997 typescript parameters.');
