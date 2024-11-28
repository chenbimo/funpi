// 工具函数
import { fnRoute } from '../../utils/index.js';
// 配置文件
import { appConfig } from '../../app.js';

// 处理函数
export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {}
        },
        // 执行函数
        apiHandler: async () => {
            try {
                const result = await fastify.redisGet(appConfig.cache.api);

                return {
                    ...appConfig.http.SELECT_SUCCESS,
                    data: {
                        rows: result
                    }
                };
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.SELECT_FAIL;
            }
        }
    });
};
