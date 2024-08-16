import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

import { appConfig } from '../config/app.js';

async function plugin(fastify) {
    try {
        await fastify.register(rateLimit, {
            global: appConfig.rateglobal || true,
            max: appConfig.ratemax || 100,
            ban: null,
            timeWindow: appConfig.ratetimeWindow || 1000 * 10,
            hook: appConfig.ratehook || 'onRequest',
            cache: appConfig.ratecache || 10000,
            allowList: appConfig.rateallowList || ['127.0.0.1', 'localhost'],
            redis: null,
            nameSpace: appConfig.ratenamespace || 'test_rate:',
            continueExceeding: true,
            skipOnError: true,
            keyGenerator: function (req) {
                return req.headers['x-real-ip'] || req.headers['x-client-ip'] || req.ip || req.headers['x-forwarded-for'];
            },
            onExceeded(req, key) {
                fastify.log.warn({
                    key: key,
                    message: '请求过快',
                    apiPath: req?.url,
                    session: req?.session,
                    reqId: req?.id
                });
            }
        });
    } catch (err) {
        fastify.log.error(err);
    }
}

export default fp(plugin, { name: 'funpiRate', dependencies: ['funpiRedis'] });
