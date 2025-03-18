// 内部模块
import { existsSync } from 'node:fs';
import { join } from 'node:path';
// 外部模块
import fp from 'fastify-plugin';
import picomatch from 'picomatch';
import { uniq as es_uniq, isPlainObject as es_isPlainObject } from 'es-toolkit';
import { find as es_find } from 'es-toolkit/compat';
// 配置文件
import { appConfig } from '../app.js';
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
                res.send({ code: 0, msg: `${process.env.APP_NAME} 接口程序已启动` });
                return;
            }
            if (routePath.startsWith('/swagger/')) return;

            /* --------------------------------- 接口禁用检测 --------------------------------- */
            const isMatchBlackApi = picomatch.isMatch(routePath, []);
            if (isMatchBlackApi === true) {
                res.send(appConfig.http.API_DISABLED);
                return;
            }

            /* --------------------------------- 请求资源判断 --------------------------------- */
            if (routePath.startsWith('/public')) {
                const filePath = join(appConfig.appDir, routePath);
                if (existsSync(filePath) === true) {
                    return;
                } else {
                    // 文件不存在
                    res.send(appConfig.http.NO_FILE);
                    return;
                }
            }

            /* --------------------------------- 解析用户登录参数 --------------------------------- */
            let isAuthFail = false;
            try {
                await req.jwtVerify();
                // eslint-disable-next-line no-unused-vars
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

            /* --------------------------------- 自由接口判断 --------------------------------- */
            const isMatchFreeApi = picomatch.isMatch(routePath, ['/', '/favicon.*', '/public/**', '/api/admin/adminLogin']);
            // 如果是自由通行的接口，则直接返回
            if (isMatchFreeApi === true) return;

            /* --------------------------------- 接口存在性判断 -------------------------------- */
            const allApiNames = await fastify.redisGet(appConfig.cache.apiNames);

            if (allApiNames.includes(routePath) === false) {
                res.send(appConfig.http.NO_API);
                return;
            }

            /* --------------------------------- 接口登录检测 --------------------------------- */
            if (isAuthFail === true) {
                res.send({
                    ...appConfig.http.NOT_LOGIN,
                    detail: 'token 验证失败'
                });
                return;
            }

            /* --------------------------------- 上传参数检测 --------------------------------- */
            if (process.env.PARAMS_CHECK === '1') {
                const result = await fnApiCheck(req);
                if (result.code !== 0) {
                    res.send({
                        ...appConfig.http.PARAMS_SIGN_FAIL,
                        detail: result?.msg || ''
                    });
                    return;
                }
            }

            /* ---------------------------------- 白名单判断 --------------------------------- */
            // 从缓存获取白名单接口
            const dataApiWhiteLists = await fastify.redisGet(appConfig.cache.apiWhiteLists);
            const whiteApis = dataApiWhiteLists?.map((item) => item.value) || [];
            const allWhiteApis = es_uniq(whiteApis);

            // 是否匹配白名单
            const isMatchWhiteApi = picomatch.isMatch(routePath, allWhiteApis);

            if (isMatchWhiteApi === true) return;

            /* ---------------------------------- 角色接口权限判断 --------------------------------- */
            // 如果接口不在白名单中，则判断用户是否有接口访问权限
            const userApis = await fastify.getUserApis(req.session);
            const hasApi = es_find(userApis, ['value', routePath.replace('/api/', '/')]);

            if (!hasApi) {
                res.send({
                    ...appConfig.http.FAIL,
                    msg: `您没有 [ ${req?.routeOptions?.schema?.summary || routePath} ] 接口的操作权限`
                });
                return;
            }
        } catch (err) {
            fastify.log.error(err);
            res.send({
                ...appConfig.http.FAIL,
                msg: err.msg || '认证异常',
                other: err.other || ''
            });
            return res;
        }
    });
}
export default fp(plugin, { name: 'funpiAuth', dependencies: ['funpiCors', 'funpiMysql', 'funpiTool'] });
