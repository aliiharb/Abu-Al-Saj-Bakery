import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import dotenv from 'dotenv';

function findProjectRoot(startDirectory = process.cwd()) {
  let currentDirectory = resolve(startDirectory);

  while (true) {
    if (existsSync(resolve(currentDirectory, 'netlify.toml'))) {
      return currentDirectory;
    }

    const parentDirectory = dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      return resolve(startDirectory);
    }

    currentDirectory = parentDirectory;
  }
}

const projectRoot = findProjectRoot();

dotenv.config({ path: resolve(projectRoot, '.env') });
dotenv.config({ path: resolve(projectRoot, 'server/.env') });
