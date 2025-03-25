// 内核模块
import { resolve, basename } from 'pathe';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
// 外部模块
import Ajv from 'ajv';

// 内部模块

// 配置文件
import { appDir, funpiDir } from '../config/path.js';

import { envConfig } from '../config/env.js';
import { menuConfig as internalMenuConfig } from '../config/menu.js';
// 协议配置
import { envSchema } from '../schema/env.js';
import { menuSchema } from '../schema/menu.js';
// 工具函数
import { fnImport, log4state, fnIsCamelCase, fnApiFiles, fnApiFilesCheck } from './index.js';
import { ajvZh } from './ajvZh.js';

export const initCheck = async (fastify) => {
    // 判断运行目录下是否有 funpi.js 文件
    if (existsSync(resolve(appDir, 'funpi.js')) === false) {
        console.log(`${log4state('warn')} 请在 funpi 项目根目录下运行`);
        process.exit();
    }

    // 确保关键目录存在 ==================================================
    if (existsSync(resolve(appDir, 'addons')) === false) {
        mkdirSync(resolve(appDir, 'addons'));
    }
    if (existsSync(resolve(appDir, 'apis')) === false) {
        mkdirSync(resolve(appDir, 'apis'));
    }
    if (existsSync(resolve(appDir, 'config')) === false) {
        mkdirSync(resolve(appDir, 'config'));
    }
    if (existsSync(resolve(appDir, 'tables')) === false) {
        mkdirSync(resolve(appDir, 'tables'));
    }
    if (existsSync(resolve(appDir, 'plugins')) === false) {
        mkdirSync(resolve(appDir, 'plugins'));
    }
    if (existsSync(resolve(appDir, 'logs')) === false) {
        mkdirSync(resolve(appDir, 'logs'));
    }
    if (existsSync(resolve(appDir, 'public')) === false) {
        mkdirSync(resolve(appDir, 'public'));
    }

    const ajv = new Ajv({
        strict: false,
        allErrors: true,
        verbose: false
    });

    // 验证配置文件 ==================================================
    const validEnvResult = ajv.validate(envSchema, envConfig);
    if (!validEnvResult) {
        ajvZh(ajv.errors);
        console.log(log4state('error'), '[  环境变量错误 ] \n' + ajv.errorsText(ajv.errors, { separator: '\n' }));
        process.exit();
    }

    // 验证菜单配置
    const { menuConfig: userMenuConfig } = await fnImport(resolve(appDir, 'config', 'menu.js'), 'menuConfig', {});
    const allMenuConfig = [...userMenuConfig, ...internalMenuConfig];
    const validMenuResult = ajv.validate(menuSchema, allMenuConfig);
    if (!validMenuResult) {
        ajvZh(ajv.errors);
        console.log(log4state('error'), '[  菜单配置错误 ] \n' + ajv.errorsText(ajv.errors, { separator: '\n' }));
        process.exit();
    }

    const menuPaths = new Set();

    for (const menu of allMenuConfig) {
        // 检查主菜单路径
        if (menuPaths.has(menu.path)) {
            console.log(log4state('error'), '[  重复的菜单路径 ] ' + menu.path);
            process.exit();
        }
        menuPaths.add(menu.path);

        // 检查子菜单路径
        for (const child of menu.children) {
            if (menuPaths.has(child.path)) {
                console.log(log4state('error'), '[  重复的菜单路径 ] ' + child.path);
                process.exit();
            }
            menuPaths.add(child.path);
        }
    }

    // 接口检测
    await fnApiFilesCheck();

    // ==================================================

    // 启动前验证
    if (process.env.MD5_SALT === 'funpi123456') {
        console.log(`${log4state('warn')} 请修改默认加密盐值！位置：process.env.MD5_SALT`);
    }

    if (process.env.DEV_PASSWORD === 'funpi123456') {
        console.log(`${log4state('warn')} 请修改开发管理员密码！位置：process.env.DEV_PASSWORD`);
    }

    if (process.env.JWT_SECRET === 'funpi123456') {
        console.log(`${log4state('warn')} 请修改 JWT 密钥！位置：process.env.JWT_SECRET`);
    }
};
