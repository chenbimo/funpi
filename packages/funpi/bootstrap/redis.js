import fp from 'fastify-plugin';
import { createClient } from 'redis';

async function plugin(fastify, opts) {
    if (fastify.redis) {
        return;
    }
    const client = await createClient({
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        database: Number(process.env.REDIS_DB),
        socket: {
            reconnectStrategy: (retries) => {
                return false;
            }
        }
    })
        .on('error', (err) => {
            fastify.log.error({ msg: 'Redis连接失败', detail: err });
            process.exit(1);
        })
        .connect();

    fastify.decorate('redis', client);
}
export default fp(plugin, { name: 'funpiRedis' });
