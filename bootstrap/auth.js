// 内部模块
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
// 外部模块
import fp from 'fastify-plugin';
import picomatch from 'picomatch';
import { yd_object_omit, yd_array_unique, yd_array_findObj } from 'yidash';
// 配置文件
import { system } from '../system.js';
import { appConfig } from '../config/app.js';
// 工具函数
import { fnApiCheck } from '../utils/fnApiCheck.js';

async function plugin(fastify) {
    fastify.addHook('preHandler', async (req, res) => {
        try {
            const urls = new URL(req.url, 'http://127.0.0.1');
            const routePath = urls.pathname;
            // 如果是收藏图标，则直接通过
            if (routePath === 'favicon.ico') return;
            if (routePath === '/') {
                res.send({ code: 0, msg: `${appConfig.appName} 接口程序已启动` });
                return;
            }
            if (routePath.startsWith('/swagger')) return;

            /* --------------------------------- 接口禁用检测 --------------------------------- */
            const isMatchBlackApi = picomatch.isMatch(routePath, appConfig.blackApis);
            if (isMatchBlackApi === true) {
                res.send(appConfig.http.API_DISABLED);
                return;
            }

            /* --------------------------------- 解析用户登录参数 --------------------------------- */
            let isAuthFail = false;
            try {
                await req.jwtVerify();
            } catch (err) {
                fastify.log.error(err);
                isAuthFail = true;
            }

            /* --------------------------------- 自由接口判断 --------------------------------- */
            const isMatchFreeApi = picomatch.isMatch(routePath, appConfig.freeApis);
            // 如果是自由通行的接口，则直接返回
            if (isMatchFreeApi === true) return;

            /* --------------------------------- 请求资源判断 --------------------------------- */
            if (routePath.indexOf('.') !== -1) {
                if (existsSync(resolve(system.appDir, 'public', routePath)) === true) {
                    return;
                } else {
                    // 文件不存在
                    res.send(appConfig.http.NO_FILE);
                    return;
                }
            }

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

            /* ---------------------------------- 日志记录 ---------------------------------- */
            /**
             * 如果请求的接口不是文档地址
             * 才进行日志记录
             * 减少无意义的日志
             */
            fastify.log.warn({
                apiPath: req?.url,
                body: yd_object_omit(req?.body || {}, appConfig.reqParamsFilter),
                session: req?.session,
                reqId: req?.id
            });

            /* --------------------------------- 上传参数检测 --------------------------------- */
            if (appConfig.paramsCheck !== false) {
                await fnApiCheck(req);
            }

            /* ---------------------------------- 白名单判断 --------------------------------- */
            // 从缓存获取白名单接口
            const dataApiWhiteLists = await fastify.redisGet(appConfig.cache.apiWhiteLists);
            const whiteApis = dataApiWhiteLists?.map((item) => item.value);
            const allWhiteApis = yd_array_unique([...appConfig.whiteApis, ...(whiteApis || [])]);

            // 是否匹配白名单
            const isMatchWhiteApi = picomatch.isMatch(routePath, allWhiteApis);

            if (isMatchWhiteApi === true) return;

            /* ---------------------------------- 角色接口权限判断 --------------------------------- */
            // 如果接口不在白名单中，则判断用户是否有接口访问权限
            const userApis = await fastify.getUserApis(req.session);
            const hasApi = yd_array_findObj(userApis, 'value', routePath.replace('/api/', '/'));

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
export default fp(plugin, { name: 'auth', dependencies: ['cors', 'mysql', 'tool'] });
