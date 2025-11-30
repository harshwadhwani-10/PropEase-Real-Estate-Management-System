import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const log = console.log;

const IGNORED_FOLDERS = new Set([
  'node_modules',
  'public',
  '.git',
  '.vscode',
  'assets',
  '.husky',
  '.next',
  '.angular',
  'android',
  'ios',
  'build',
]);

const MAX_ITEMS_PER_FOLDER = 1200;

function listDirectoryStructure(dirPath, prefix = '') {
  const folderName = path.basename(dirPath);

  if (!fs.existsSync(dirPath)) {
    log(`❌ Directory not found: ${dirPath}`);
    return;
  }

  if (IGNORED_FOLDERS.has(folderName)) return;

  const contents = fs.readdirSync(dirPath).filter(f => !IGNORED_FOLDERS.has(f));

  if (contents.length > MAX_ITEMS_PER_FOLDER) {
    log(`⚠️ Too many items in: ${dirPath} — skipped`);
    return;
  }

  contents.forEach((item, index) => {
    const fullPath = path.join(dirPath, item);
    const stats = fs.statSync(fullPath);
    const isLast = index === contents.length - 1;
    const branch = isLast ? '└── ' : '├── ';
    const newPrefix = prefix + (isLast ? '    ' : '│   ');

    if (stats.isDirectory()) {
      log(`${prefix}${branch}${item}/`);
      listDirectoryStructure(fullPath, newPrefix);
    } else {
      log(`${prefix}${branch}${item}`);
    }
  });
}

function printDirectoryStructure() {
  const rootPath = __dirname;
  const rootName = path.basename(rootPath);
  log(`📁 ${rootName}/`);
  listDirectoryStructure(rootPath);
}

printDirectoryStructure();
