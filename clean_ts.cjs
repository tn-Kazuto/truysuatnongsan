const fs = require('fs');

const figmaAppPath = 'e:\\demoNongsanproject\\frontend\\src\\FigmaApp.jsx';

try {
  let code = fs.readFileSync(figmaAppPath, 'utf8');

  // Strip type annotations in function signatures, e.g. e: React.FormEvent
  code = code.replace(/:\s*React\.FormEvent/g, '');
  
  // Strip type definitions like fieldBook?: FieldActivity[];
  code = code.replace(/\bfieldBook\??:\s*\w+\[\];?/g, '');
  
  // Strip inputs type
  code = code.replace(/\binputs\??:\s*\{[\s\S]*?\};/g, '');
  
  // Strip qualityTests type
  code = code.replace(/\bqualityTests\??:\s*\{[\s\S]*?\};/g, '');
  
  // Strip generic annotations in interfaces
  code = code.replace(/:\s*FieldActivity\b/g, '');
  
  // Strip any remaining TypeScript colon-types inside variable definitions or object definitions
  // e.g. newActivity: FieldActivity =
  code = code.replace(/const\s+(\w+):\s*\w+\s*=/g, 'const $1 =');

  // Remove type definitions
  code = code.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
  
  // Remove interface definitions
  code = code.replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '');

  // Strip braces / brackets from dangling interface pieces
  code = code.replace(/^\s*\};\s*$/gm, '');
  code = code.replace(/^\s*\}\s*$/gm, '');
  
  // Clean up duplicate semi-colons or trailing brackets
  code = code.replace(/;\s*;/g, ';');

  fs.writeFileSync(figmaAppPath, code, 'utf8');
  console.log('Successfully fully cleaned TypeScript types from FigmaApp.jsx');
} catch (error) {
  console.error('Error stripping types:', error);
}
