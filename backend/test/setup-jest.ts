import * as dotenv from 'dotenv';
import * as path from 'path';

// Always use .env.test file for testing
const envFileName = '.env.test';

const envFilePath = path.resolve(process.cwd(), envFileName);
dotenv.config({
  path: envFilePath,
  override: true,
});
