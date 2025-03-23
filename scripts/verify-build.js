import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');
const publicDir = path.join(__dirname, '../public');

function verifyBuild() {
  try {
    // Check if dist directory exists
    if (!fs.existsSync(distDir)) {
      throw new Error('Build directory not found');
    }

    // Check if PDF.js worker exists in public directory
    const workerFile = path.join(publicDir, 'pdf.worker.min.js');
    if (!fs.existsSync(workerFile)) {
      throw new Error('PDF.js worker file not found in public directory');
    }

    // Check if worker file is copied to dist
    const distWorkerFile = path.join(distDir, 'pdf.worker.min.js');
    if (!fs.existsSync(distWorkerFile)) {
      throw new Error('PDF.js worker file not found in dist directory');
    }

    // Verify file sizes
    const publicSize = fs.statSync(workerFile).size;
    const distSize = fs.statSync(distWorkerFile).size;

    if (publicSize !== distSize) {
      throw new Error('PDF.js worker file sizes do not match between public and dist');
    }

    // Check for main entry point
    const mainEntry = path.join(distDir, 'index.html');
    if (!fs.existsSync(mainEntry)) {
      throw new Error('Main entry point not found');
    }

    // Check for assets directory
    const assetsDir = path.join(distDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      throw new Error('Assets directory not found');
    }

    console.log('Build verification successful!');
    console.log('All required files are present and valid.');
  } catch (error) {
    console.error('Build verification failed:', error);
    process.exit(1);
  }
}

verifyBuild(); 