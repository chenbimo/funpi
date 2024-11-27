// 内部模块
// 外部模块
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
// 配置文件
import { appConfig } from '../app.js';

async function plugin(fastify) {
    await fastify.register(fastifyJwt, {
        secret: appConfig.jwt.secret,
        decoratorName: 'session',
        decode: {
            complete: true
        },
        sign: {
            algorithm: 'HS256',
            expiresIn: appConfig.jwt.expiresIn
        },
        verify: {
            algorithms: ['HS256']
        }
    });
}
export default fp(plugin, { name: 'jwt' });
