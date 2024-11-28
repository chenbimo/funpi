import { fnRoute } from '../../utils/index.js';
import { appConfig } from '../../app.js';

// 处理函数
export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 请求参数约束
        schemaRequest: {
            type: 'object',
            properties: {},
            required: []
        },
        // 执行函数
        apiHandler: async (req) => {
            try {
                try {
                    const jwtData = await req.jwtVerify();
                    return {
                        ...appConfig.http.SUCCESS,
                        data: {
                            state: 'yes'
                        },
                        detail: jwtData
                    };
                } catch (err) {
                    fastify.log.error(err);
                    return {
                        ...appConfig.http.SUCCESS,
                        data: {
                            state: 'no'
                        }
                    };
                }
            } catch (err) {
                fastify.log.error(err);
                return appConfig.http.FAIL;
            }
        }
    });
};
