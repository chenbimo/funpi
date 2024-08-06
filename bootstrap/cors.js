import fp from 'fastify-plugin';
import fastifyCors from '@fastify/cors';

async function plugin(fastify) {
    await fastify.register(fastifyCors, function () {
        return (req, callback) => {
            // 默认跨域，如果需要指定请求前缀，可以被传入的参数覆盖
            const newCorsConfig = {
                origin: req.headers.origin || req.headers.host || '*',
                methods: ['GET', 'OPTIONS', 'POST'],
                allowedHeaders: ['Content-Type', 'Authorization', 'authorization', 'token'],
                exposedHeaders: ['Content-Range', 'X-Content-Range', 'Authorization', 'authorization', 'token'],
                preflightContinue: false,
                strictPreflight: false,
                preflight: true,
                optionsSuccessStatus: 204,
                credentials: false
            };

            callback(null, newCorsConfig);
        };
    });
}
export default fp(plugin, { name: 'cors' });
