const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('./.env.production'));

module.exports = {
    apps: [
        {
            name: 'funpi',
            instances: 1,
            script: './funpi.js',
            exec_mode: 'cluster',
            watch: false,
            autorestart: true,
            interpreter: 'bun',
            ignore_watch: ['node_modules', 'logs', 'data'],
            env: envConfig,
            log_file: './logs/funpi.log',
            error_file: './logs/funpi-error.log',
            out_file: './logs/funpi-out.log',
            max_memory_restart: '200M'
        }
    ]
};
