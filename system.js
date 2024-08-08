import { dirname } from 'node:path';
import { cwd } from 'node:process';

export const system = {
    appDir: cwd(),
    funpiDir: dirname(import.meta.filename)
};
