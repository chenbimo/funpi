import { dirname, resolve } from 'path';
export const appDir = process.cwd();
export const funpiDir = dirname(dirname(import.meta.filename));
