import { fnRoute, fnSchema, appConfig } from 'funpi';
import { tableData } from '../../tables/example.js';
import { metaConfig } from './_meta.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, metaConfig, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {
                title: fnSchema(tableData.title),
                content: fnSchema(tableData.content)
            },
            required: ['title', 'content']
        },

        // 执行函数
        apiHandler: async (req) => {
            const trx = await fastify.mysql.transaction();
            try {
                const newsModel = trx('example');

                const result = await newsModel //
                    .clone()
                    .insertData({
                        title: req.body.title,
                        content: req.body.content
                    });

                await trx.commit();
                return {
                    ...appConfig.http.INSERT_SUCCESS,
                    data: result
                };
            } catch (err) {
                await trx.rollback();
                fastify.log.error(err);
                return appConfig.http.INSERT_FAIL;
            }
        }
    });
};
