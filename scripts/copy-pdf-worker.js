import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.join(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.js');
const targetFile = path.join(__dirname, '../public/pdf.worker.min.js');

// Create public directory if it doesn't exist
if (!fs.existsSync(path.dirname(targetFile))) {
  fs.mkdirSync(path.dirname(targetFile), { recursive: true });
}

// Copy the worker file
fs.copyFileSync(sourceFile, targetFile);
console.log('PDF.js worker file copied successfully!'); 