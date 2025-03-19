// 内核模块
import { resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
// 外部模块
import Ajv from 'ajv';

// 内部模块

// 配置文件
import { appConfig } from '../config/app.js';
import { appDir, funpiDir } from '../config/path.js';
import { appSchema } from '../schema/app.js';
// 协议配置
// 工具函数
import { fnImport, log4state } from './index.js';
import { ajvZh } from './ajvZh.js';

export const initCheck = async () => {
    // 判断运行目录下是否有 funpi.js 文件
    if (existsSync(resolve(appDir, 'funpi.js')) === false) {
        console.log(`${log4state('warn')} 请在 funpi 项目根目录下运行`);
        process.exit();
    }

    // 检测环境变量
    if (['development', 'production'].includes(process.env.APP_MODE) === false) {
        console.log(`${log4state('warn')} 请正确设置 APP_MODE 环境变量`);
        process.exit();
    }

    // 确保关键目录存在 ==================================================
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
    const validResult = ajv.validate(appSchema, appConfig);
    if (!validResult) {
        ajvZh(ajv.errors);
        console.log(log4state('error'), '[  环境变量错误 ] \n' + ajv.errorsText(ajv.errors, { separator: '\n' }));
        process.exit();
    }

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
