import { fp } from 'funpi';
import fastifyMultipart from '@fastify/multipart';

async function plugin(fastify) {
    await fastify.register(fastifyMultipart, {
        attachFieldsToBody: true,
        limits: {
            fieldNameSize: 100,
            fieldSize: 100,
            fields: 10,
            fileSize: 100000000,
            files: 1,
            headerPairs: 2000,
            parts: 1000
        }
    });
}

export default fp(plugin, {
    name: 'upload'
});
