// 外部模块
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

async function plugin(fastify) {
    await fastify.register(fastifyJwt, {
        secret: Bun.env.JWT_SECRET,
        decoratorName: 'session',
        decode: {
            complete: true
        },
        sign: {
            algorithm: Bun.env.JWT_ALGORITHM,
            expiresIn: Bun.env.JWT_EXPIRES_IN
        },
        verify: {
            algorithms: [Bun.env.JWT_ALGORITHM]
        }
    });
}

export default fp(plugin, { name: 'jwt' });
