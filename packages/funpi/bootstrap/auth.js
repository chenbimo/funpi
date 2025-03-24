// 内部模块
import { existsSync } from 'node:fs';
import { join } from 'pathe';
// 外部模块
import fp from 'fastify-plugin';
import picomatch from 'picomatch';
import { uniq as es_uniq, isPlainObject as es_isPlainObject } from 'es-toolkit';
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
            const urls = new URL(req.url, 'http://127.0.0.1');
            const routePath = urls.pathname;
            // 如果是收藏图标，则直接通过
            if (routePath === 'favicon.ico') return;
            if (routePath === '/') {
                res.send({
                    code: 0,
                    msg: `${process.env.APP_NAME} 接口程序已启动`
                });
                return;
            }
            if (routePath.startsWith('/api/funpi/admin/adminLogin')) return;
            if (routePath.startsWith('/swagger/')) return;

            /* --------------------------------- 请求资源判断 --------------------------------- */
            if (routePath.startsWith('/public')) {
                const filePath = join(appDir, routePath);
                if (existsSync(filePath) === true) {
                    return;
                } else {
                    // 文件不存在
                    res.send(httpConfig.NO_FILE);
                    return;
                }
            }

            /* --------------------------------- 解析用户登录参数 --------------------------------- */
            let isAuthFail = false;
            try {
                await req.jwtVerify();
            } catch (err) {
                isAuthFail = true;
            }

            /* ---------------------------------- 日志记录 ---------------------------------- */
            /**
             * 如果请求的接口不是文档地址
             * 才进行日志记录
             * 减少无意义的日志
             */

            if (es_isPlainObject(req?.body)) {
                fastify.log.warn({
                    apiPath: req?.url,
                    body: fnDataClear(req.body),
                    session: req?.session,
                    reqId: req?.id
                });
            }

            /* --------------------------------- 接口存在性判断 -------------------------------- */
            const allApiNames = await fastify.redisGet('cacheData_apiNames');

            if (allApiNames.includes(routePath) === false) {
                res.send(httpConfig.NO_API);
                return;
            }

            /* --------------------------------- 接口禁用检测 --------------------------------- */
            const dataApiBlackLists = await fastify.redisGet('cacheData_apiBlackLists');
            const allBlackApis = es_uniq(dataApiBlackLists || []);

            const isMatchBlackApi = picomatch.isMatch(routePath, allBlackApis);
            if (isMatchBlackApi === true) {
                res.send(httpConfig.API_DISABLED);
                return;
            }

            /* ---------------------------------- 白名单判断 --------------------------------- */
            // 从缓存获取白名单接口
            const dataApiWhiteLists = await fastify.redisGet('cacheData_apiWhiteLists');
            const allWhiteApis = es_uniq(dataApiWhiteLists || []);

            // 是否匹配白名单
            const isMatchWhiteApi = picomatch.isMatch(routePath, allWhiteApis);

            if (isMatchWhiteApi === true) return;

            /* --------------------------------- 接口登录检测 --------------------------------- */
            if (isAuthFail === true) {
                res.send({
                    ...httpConfig.NOT_LOGIN,
                    detail: 'Token 验证失败'
                });
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
            const hasApi = es_find(userApis, ['value', routePath.replace('/api/', '/')]);

            if (!hasApi) {
                res.send({
                    ...httpConfig.FAIL,
                    msg: `您没有 [ ${req?.routeOptions?.schema?.summary || routePath} ] 接口的操作权限`
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
