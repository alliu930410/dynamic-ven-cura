import * as dotenv from 'dotenv';
import * as path from 'path';

let envFileName: string;
if (process.env.NODE_ENV === 'test') {
  envFileName = '.env.test';
} else {
  envFileName = '.env';
}

const envFilePath = path.resolve(process.cwd(), envFileName);
dotenv.config({
  path: envFilePath,
  override: true,
});
