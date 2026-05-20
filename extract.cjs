const fs = require('fs');
const path = require('path');

const domFilePath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\e02f5bed-5e0e-4406-9cca-3d0f57482cc3\\.tempmediaStorage\\dom_1779200495973.txt`;

try {
  const content = fs.readFileSync(domFilePath, 'utf8');
  // Match starting from href='#code and ending just before ' id='l'>
  const regex = /href='#code([\s\S]*?)'\s+id='l'>/;
  const match = content.match(regex);
  if (match && match[1]) {
    const encodedCode = match[1];
    const decodedCode = decodeURIComponent(encodedCode);
    
    // Save to FigmaApp.jsx
    const outputPath = path.join(__dirname, 'frontend', 'src', 'FigmaApp.jsx');
    fs.writeFileSync(outputPath, decodedCode, 'utf8');
    console.log(`Success! Decoded React code written to ${outputPath}`);
    console.log(`Length of decoded code: ${decodedCode.length} characters`);
  } else {
    console.error('Could not find the code link using the revised regex.');
  }
} catch (error) {
  console.error('Error processing file:', error);
}
