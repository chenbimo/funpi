import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

async function plugin(fastify) {
    await fastify.register(fastifySwagger, {
        mode: 'dynamic',
        swagger: {
            info: {
                title: `${process.env.APP_NAME}接口文档`,
                description: `${process.env.APP_NAME}接口文档`,
                version: '1.0.0'
            },
            host: '127.0.0.1',
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json']
        }
    });

    await fastify.register(fastifySwaggerUi, {
        routePrefix: '/swagger',
        initOAuth: {},
        uiConfig: {
            docExpansion: 'none',
            deepLinking: false
        },
        staticCSP: true
    });
}
export default fp(plugin, {
    name: 'swagger'
});
