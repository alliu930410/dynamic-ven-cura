import * as dotenv from 'dotenv';
import * as path from 'path';

let envFileName;
if (process.env.NODE_ENV_IS_CI === 'true') {
  envFileName = '.env.test-ci';
} else {
  envFileName = '.env.test';
}

const envFilePath = path.resolve(process.cwd(), envFileName);
dotenv.config({
  path: envFilePath,
  override: true,
});
