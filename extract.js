const fs = require('fs');
const path = require('path');

const domFilePath = `C:\\Users\\Admin\\.gemini\\antigravity\\brain\\e02f5bed-5e0e-4406-9cca-3d0f57482cc3\\.tempmediaStorage\\dom_1779200495973.txt`;

try {
  const content = fs.readFileSync(domFilePath, 'utf8');
  // Find the href attribute
  const regex = /<a href='#code([^']+)'/;
  const match = content.match(regex);
  if (match && match[1]) {
    const encodedCode = match[1];
    const decodedCode = decodeURIComponent(encodedCode);
    
    // Save it to a file
    const outputPath = path.join(__dirname, 'frontend', 'src', 'FigmaApp.tsx');
    fs.writeFileSync(outputPath, decodedCode, 'utf8');
    console.log(`Success! Decoded React code written to ${outputPath}`);
  } else {
    console.error('Could not find the code link in the DOM dump file.');
  }
} catch (error) {
  console.error('Error processing file:', error);
}
