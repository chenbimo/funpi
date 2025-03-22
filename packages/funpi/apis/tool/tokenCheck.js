import { fnRoute } from '../../utils/index.js';
import { httpConfig } from '../../config/http.js';

export default async (fastify) => {
    fnRoute(import.meta.url, fastify, {
        // 接口名称
        apiName: '令牌验证',
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
                        ...httpConfig.SUCCESS,
                        data: {
                            state: 'yes'
                        },
                        detail: jwtData
                    };
                } catch (err) {
                    fastify.log.error(err);
                    return {
                        ...httpConfig.SUCCESS,
                        data: {
                            state: 'no'
                        }
                    };
                }
            } catch (err) {
                fastify.log.error(err);
                return httpConfig.FAIL;
            }
        }
    });
};
