import { dirname } from 'node:path';
import { cwd } from 'node:process';

export const system = {
    appDir: cwd(),
    yeeDir: dirname(import.meta.filename)
};
