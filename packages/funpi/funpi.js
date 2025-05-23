// 核心模块
import { resolve, join } from 'pathe';
// 外部模块
import Fastify from 'fastify';
import autoLoad from '@fastify/autoload';
import fp from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import Ajv from 'ajv';
// 启动插件
import swaggerPlugin from './plugins/swagger.js';
import loggerPlugin from './plugins/logger.js';
import jwtPlugin from './plugins/jwt.js';
import xmlParsePlugin from './bootstrap/xmlParse.js';
import uploadPlugin from './bootstrap/upload.js';
import redisPlugin from './bootstrap/redis.js';
import mysqlPlugin from './bootstrap/mysql.js';
import toolPlugin from './bootstrap/tool.js';
import corsPlugin from './bootstrap/cors.js';
import authPlugin from './bootstrap/auth.js';
import mailPlugin from './bootstrap/mail.js';
import syncApiPlugin from './bootstrap/syncApi.js';
import syncMenuPlugin from './bootstrap/syncMenu.js';
import syncRolePlugin from './bootstrap/syncRole.js';

// 工具函数
import { fnRoute, fnSchema, fnField, fnIncrTimeID } from './utils/index.js';
import { ajvZh } from './utils/ajvZh.js';

// 数据库表
import { tableData as adminTable } from './tables/admin.js';
import { tableData as apiTable } from './tables/api.js';
import { tableData as menuTable } from './tables/menu.js';
import { tableData as roleTable } from './tables/role.js';

// 脚本列表
import { initCheck } from './utils/check.js';

// 配置信息
import { appDir, funpiDir } from './config/path.js';
import { httpConfig } from './config/http.js';

// 初始化服务
const initServer = async () => {
    // 初始化项目实例
    const fastify = Fastify({
        loggerInstance: loggerPlugin,
        pluginTimeout: 0,
        bodyLimit: Number(process.env.BODY_LIMIT) * 1048576,
        ajv: {
            customOptions: {
                allErrors: true,
                verbose: true
            }
        }
    });

    // 处理全局错误
    fastify.setErrorHandler(function (err, req, res) {
        if (err.validation) {
            ajvZh(err.validation);
            const msg = err.validation
                .map((error) => {
                    return (error.parentSchema.title + ' ' + error.message).trim();
                })
                .join(',');
            res.status(200).send({
                code: 1,
                msg: msg,
                symbol: 'GLOBAL_ERROR'
            });
            return;
        }

        if (err.statusCode >= 500) {
            fastify.log.error(err);
            // 发送错误响应
        } else if (err.statusCode === 429) {
            err.message = '请求过快，请降低请求频率。';
        } else if (err.statusCode >= 400) {
            fastify.log.warn(err);
        } else {
            fastify.log.warn(err);
        }

        // 发送错误响应
        res.status(200).send({
            code: 1,
            msg: err.message,
            symbol: 'GLOBAL_ERROR'
        });
    });

    // 处理未找到路由
    fastify.setNotFoundHandler(function (req, res) {
        // 发送错误响应
        res.status(200).send({
            code: 1,
            msg: '未知路由',
            data: req.url
        });
    });

    // 静态资源托管
    fastify.register(fastifyStatic, {
        root: resolve(appDir, 'public'),
        prefix: '/public/',
        list: true
    });
    // 初始化检查
    await initCheck(fastify);
    // 加载启动插件
    fastify.register(jwtPlugin, {});
    fastify.register(xmlParsePlugin, {});
    fastify.register(uploadPlugin, {});
    fastify.register(redisPlugin, {});
    fastify.register(mysqlPlugin, {});
    fastify.register(toolPlugin, {});
    fastify.register(corsPlugin, {});
    fastify.register(authPlugin, {});
    fastify.register(mailPlugin, {});
    fastify.register(syncMenuPlugin, {});
    fastify.register(syncApiPlugin, {});
    fastify.register(syncRolePlugin, {});

    // 加载用户插件
    fastify.register(autoLoad, {
        dir: join(appDir, 'plugins'),
        matchFilter: (_path) => {
            return _path.endsWith('.js') === true;
        },
        ignorePattern: /^[_.]/
    });

    // 加载插件的插件
    fastify.register(autoLoad, {
        dir: join(appDir, 'addons'),
        matchFilter: (_path) => {
            const [_, plugins, dir, file] = _path.split('/');
            return plugins === 'plugins' && file.endsWith('.js') === true;
        },
        ignorePattern: /^[_.]/
    });

    // 加载系统接口
    fastify.register(autoLoad, {
        dir: join(funpiDir, 'apis'),
        matchFilter: (_path) => {
            return _path.endsWith('.js') === true;
        },
        ignorePattern: /^[_.]/,
        options: {
            prefix: '/api/funpi'
        }
    });

    // 加载用户接口
    fastify.register(autoLoad, {
        dir: join(appDir, 'apis'),
        matchFilter: (_path) => {
            return _path.endsWith('.js') === true;
        },
        ignorePattern: /^[_.]/,
        options: {
            prefix: '/api/app'
        }
    });

    // 加载插件接口
    fastify.register(autoLoad, {
        dir: join(appDir, 'addons'),
        matchFilter: (_path) => {
            const [_, apis, dir, file] = _path.split('/').filter((v) => v);
            const isPass = apis === 'apis' && file.endsWith('.js') === true;
            return isPass;
        },
        ignorePattern: /^[_.]/,
        options: {
            prefix: '/api/addon'
        },
        dirNameRoutePrefix: function rewrite(folderParent, folderName) {
            if (folderName === 'apis') return false;
            return folderName;
        }
    });
    // 启动服务！
    fastify.listen({ port: Number(process.env.APP_PORT), host: process.env.LISTEN_HOST }, function (err, address) {
        if (err) {
            fastify.log.error(err);
            process.exit();
        }
        fastify.log.warn(`${process.env.APP_NAME} 接口服务已启动： ${address}`);
        console.log(`${process.env.APP_NAME} 接口服务已启动： ${address}`);
    });
};

export {
    //
    fp,
    initServer,
    Ajv,
    ajvZh,
    // 环境目录
    appDir,
    funpiDir,
    // 工具函数
    fnRoute,
    fnSchema,
    fnField,
    fnIncrTimeID,
    // 配置数据
    httpConfig,
    // 数据库表
    adminTable,
    apiTable,
    menuTable,
    roleTable
};
