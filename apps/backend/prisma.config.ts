import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { defineConfig } from 'prisma/config';

// Load env.yaml directly (prisma.config.ts runs outside NestJS context)
const envPath = path.resolve(process.cwd(), '.env.yaml');
const samplePath = path.resolve(process.cwd(), 'env.yaml');
const filePath = fs.existsSync(envPath) ? envPath : samplePath;

if (fs.existsSync(filePath)) {
  const parsed = yaml.load(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
  if (parsed && typeof parsed === 'object') {
    for (const [key, value] of Object.entries(parsed)) {
      if (!process.env[key]) {
        process.env[key] = String(value);
      }
    }
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env['DATABASE_URL'] ?? '',
  },
});
