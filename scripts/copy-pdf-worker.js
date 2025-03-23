import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.join(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.js');
const targetFile = path.join(__dirname, '../public/pdf.worker.min.js');

try {
  // Create public directory if it doesn't exist
  const publicDir = path.dirname(targetFile);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('Created public directory');
  }

  // Check if source file exists
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`Source file not found: ${sourceFile}`);
  }

  // Copy the worker file
  fs.copyFileSync(sourceFile, targetFile);
  console.log('PDF.js worker file copied successfully!');

  // Verify the copy
  if (!fs.existsSync(targetFile)) {
    throw new Error('Failed to verify copied file');
  }

  // Log file sizes for verification
  const sourceSize = fs.statSync(sourceFile).size;
  const targetSize = fs.statSync(targetFile).size;
  console.log(`Source file size: ${sourceSize} bytes`);
  console.log(`Target file size: ${targetSize} bytes`);

  if (sourceSize !== targetSize) {
    throw new Error('File sizes do not match');
  }
} catch (error) {
  console.error('Error copying PDF.js worker file:', error);
  process.exit(1);
} 