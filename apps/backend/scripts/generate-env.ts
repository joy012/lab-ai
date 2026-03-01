import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const samplePath = path.resolve(__dirname, '..', 'env.yaml');
const outputPath = path.resolve(__dirname, '..', '.env.yaml');

if (fs.existsSync(outputPath)) {
  console.log('.env.yaml already exists. Skipping generation.');
  console.log('Delete .env.yaml first if you want to regenerate.');
  process.exit(0);
}

if (!fs.existsSync(samplePath)) {
  console.error('env.yaml sample file not found!');
  process.exit(1);
}

fs.copyFileSync(samplePath, outputPath);
console.log('.env.yaml generated from env.yaml');
console.log('Update the values in .env.yaml with your actual credentials.');
