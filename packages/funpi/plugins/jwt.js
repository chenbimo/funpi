// 外部模块
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

async function plugin(fastify) {
    await fastify.register(fastifyJwt, {
        secret: process.env.JWT_SECRET,
        decoratorName: 'session',
        decode: {
            complete: true
        },
        sign: {
            algorithm: process.env.JWT_ALGORITHM,
            expiresIn: process.env.JWT_EXPIRES_IN
        },
        verify: {
            algorithms: [process.env.JWT_ALGORITHM]
        }
    });
}

export default fp(plugin, { name: 'jwt' });
