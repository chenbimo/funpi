import { Cron } from 'croner';
import fp from 'fastify-plugin';
import { isFunction as es_isFunction } from 'es-toolkit';
import { log4state } from '../utils/index.js';

// 工具函数

// 配置信息
import { appConfig } from '../app.js';

function plugin(fastify, opts, next) {
    appConfig.cron.forEach((item) => {
        if (es_isFunction(item.handler) === false) {
            console.log(log4state('error'), `${item.name} 定时器 handler 必须为一个函数`);
            process.exit();
        }
        const options = {
            name: item.name,
            maxRuns: item.maxRuns,
            timezone: item.timezone
        };
        const job = Cron(item.timer, options, () => {
            item.handler(appConfig);
        });
        fastify.decorate(item.code, job);
    });
    next();
}
export default fp(plugin, { name: 'funpiCron', dependencies: ['funpiTool'] });
