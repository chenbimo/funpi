import { dirname, resolve, normalize } from 'pathe';
export const appDir = normalize(process.cwd());
export const funpiDir = dirname(dirname(import.meta.filename));
