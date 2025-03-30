// 内部模块
import { existsSync } from 'node:fs';
import { join } from 'pathe';
// 外部模块
import fp from 'fastify-plugin';
import picomatch from 'picomatch';
import { find as es_find } from 'es-toolkit/compat';
// 配置文件
import { appDir } from '../config/path.js';
import { httpConfig } from '../config/http.js';
// 工具函数
import { fnApiCheck, fnDataClear } from '../utils/index.js';

async function plugin(fastify) {
    fastify.addHook('onRequest', async (req) => {
        if (!req.headers['Authorization'] && !req.headers['authorization']) {
            req.headers['Authorization'] = 'Bearer funpi';
        }
    });
    fastify.addHook('preHandler', async (req, res) => {
        try {
            // 如果是收藏图标，则直接通过
            if (req.url === 'favicon.ico') return;
            if (req.url === '/') {
                res.send({
                    code: 0,
                    msg: `${process.env.APP_NAME} 接口程序已启动`
                });
                return;
            }
            if (req.url.startsWith('/swagger/')) return;

            /* --------------------------------- 请求资源判断 --------------------------------- */
            if (req.url.startsWith('/public')) {
                const filePath = join(appDir, req.url);
                if (existsSync(filePath) === true) {
                    return;
                } else {
                    // 文件不存在
                    res.send(httpConfig.NO_FILE);
                    return;
                }
            }

            if (!req.routeOptions?.url || !req.routeOptions?.url?.startsWith('/api/')) {
                res.send(httpConfig.NO_API);
                return;
            }

            if (req.routeOptions.url === '/api/funpi/admin/adminLogin') return;

            /* --------------------------------- 解析用户登录参数 --------------------------------- */
            let isAuthFail = false;
            try {
                await req.jwtVerify();
            } catch (err) {
                req.session = {
                    id: 0,
                    username: 'visitor',
                    nickname: '游客',
                    role_type: 'user',
                    role: 'visitor'
                };
                isAuthFail = true;
            }

            /* ---------------------------------- 日志记录 ---------------------------------- */

            fastify.log.warn({
                apiPath: req?.url,
                body: fnDataClear(req.body),
                session: req?.session,
                reqId: req?.id
            });

            /* --------------------------------- 接口存在性判断 -------------------------------- */
            const allApiNames = await fastify.redisGet('cacheData_apiNames');

            if (allApiNames.includes(req.routeOptions.url) === false) {
                res.send(httpConfig.NO_API);
                return;
            }

            /* --------------------------------- 上传参数检测 --------------------------------- */
            if (process.env.PARAMS_CHECK === '1') {
                const result = await fnApiCheck(req);
                if (result.code !== 0) {
                    res.send({
                        ...httpConfig.PARAMS_SIGN_FAIL,
                        detail: result?.msg || ''
                    });
                    return;
                }
            }

            /* ---------------------------------- 角色接口权限判断 --------------------------------- */
            // 如果接口不在白名单中，则判断用户是否有接口访问权限
            const userApis = await fastify.getUserApis(req.session);

            const hasApi = es_find(userApis, ['value', req.routeOptions.url]);
            /* --------------------------------- 接口登录检测 --------------------------------- */

            if (!hasApi) {
                res.send({
                    ...httpConfig.FAIL,
                    msg: `您没有 [ ${req?.routeOptions?.schema?.summary || req.routeOptions.url} ] 接口的操作权限 ${isAuthFail === true ? '，请正确登录。' : ''}`
                });
                return;
            }
        } catch (err) {
            fastify.log.error(err);
            res.send({
                ...httpConfig.FAIL,
                msg: err.msg || '认证异常',
                other: err.other || ''
            });
            return res;
        }
    });
}
export default fp(plugin, { name: 'funpiAuth', dependencies: ['funpiCors', 'funpiMysql', 'funpiTool'] });
