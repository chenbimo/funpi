// 核心模块
import { resolve } from 'node:path';
// 外部模块
import winston from 'winston';
import 'winston-daily-rotate-file';

import { appConfig } from '../app.js';

const fileConfig = {
    dirname: resolve(appConfig.appDir, 'logs'),
    filename: '%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: false,
    maxSize: '50m'
};

const fileTransport = new winston.transports.DailyRotateFile(fileConfig);

const configParams = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        trace: 4,
        debug: 5
    },
    level: 'warn',
    format: winston.format.combine(
        winston.format.timestamp({
            format: () => {
                return new Date().toLocaleString('zh-CN', {
                    timeZone: appConfig.timezone,
                    hour12: false,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
        }),
        winston.format.json()
    ),
    transports: [],
    exitOnError: false
};

// 如果是产品环境，则将日志写到文件中
// 如果是开发环境，则直接打印日志
if (process.env.NODE_ENV === 'production') {
    configParams.transports = [fileTransport];
} else {
    configParams.transports = [new winston.transports.Console()];
}

const logger = winston.createLogger(configParams);

export default logger;
