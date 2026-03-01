import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export function loadEnvYaml(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), '.env.yaml');
  const samplePath = path.resolve(process.cwd(), 'env.yaml');

  const filePath = fs.existsSync(envPath) ? envPath : samplePath;

  if (!fs.existsSync(filePath)) {
    return {};
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const parsed = yaml.load(fileContents) as Record<string, unknown>;

  if (!parsed || typeof parsed !== 'object') {
    return {};
  }

  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    env[key] = String(value);
  }

  return env;
}

export function envYamlFactory() {
  const yamlEnv = loadEnvYaml();

  for (const [key, value] of Object.entries(yamlEnv)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }

  return yamlEnv;
}
