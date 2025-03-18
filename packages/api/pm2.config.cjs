const fs = require('node:fs');
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
            node_args: '--env-file=./.env.production',
            ignore_watch: ['node_modules', 'logs', 'data']
        }
    ]
};
