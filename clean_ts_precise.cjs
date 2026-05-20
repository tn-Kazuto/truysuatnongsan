const fs = require('fs');

const figmaAppPath = 'e:\\demoNongsanproject\\frontend\\src\\FigmaApp.jsx';

try {
  let content = fs.readFileSync(figmaAppPath, 'utf8');
  let lines = content.split('\n');
  
  // Remove lines 4 to 50 (0-indexed indices 3 to 49) which contain the UserRole, Language types, and FieldActivity, Product interfaces
  lines.splice(3, 47);
  
  let code = lines.join('\n');
  
  // Precise string replacements for TypeScript parameters and generics
  const replacements = [
    { from: "const mockProduct: Product =", to: "const mockProduct =" },
    { from: "function FarmerDashboard({ language }: { language: Language })", to: "function FarmerDashboard({ language })" },
    { from: "useState<'overview' | 'new-batch' | 'activity' | 'batches'>('overview')", to: "useState('overview')" },
    { from: "useState<any[]>([mockProduct])", to: "useState([mockProduct])" },
    { from: "useState<string>('')", to: "useState('')" },
    { from: "handleCreateBatch = (e: React.FormEvent)", to: "handleCreateBatch = (e)" },
    { from: "handleAddActivity = (e: React.FormEvent)", to: "handleAddActivity = (e)" },
    { from: "const newActivity: FieldActivity =", to: "const newActivity =" },
    { from: "useState<UserRole>(null)", to: "useState(null)" },
    { from: "useState<Language>('vi')", to: "useState('vi')" },
    { from: "useState<Product | null>(null)", to: "useState(null)" },
    { from: "useState<boolean>(false)", to: "useState(false)" },
    { from: "selectedProduct.fieldBook.map((activity: FieldActivity, index: number)", to: "selectedProduct.fieldBook.map((activity, index)" }
  ];
  
  for (const rep of replacements) {
    if (code.includes(rep.from)) {
      code = code.split(rep.from).join(rep.to);
      console.log(`Replaced: "${rep.from}"`);
    } else {
      console.warn(`Warning: Could not find exact match for: "${rep.from}"`);
    }
  }
  
  fs.writeFileSync(figmaAppPath, code, 'utf8');
  console.log('Successfully applied precise TypeScript to JavaScript conversion.');
} catch (error) {
  console.error('Error cleaning file:', error);
}
