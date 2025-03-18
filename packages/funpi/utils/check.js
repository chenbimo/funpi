// 内核模块
import { resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
// 外部模块
import Ajv from 'ajv';

// 内部模块

// 配置文件
import { appConfig } from '../app.js';
// 协议配置
// 工具函数
import { fnImport, log4state } from './index.js';
import { ajvZh } from './ajvZh.js';

export const initCheck = async () => {
    // 判断运行目录下是否有 funpi.js 文件
    if (existsSync(resolve(appConfig.appDir, 'funpi.js')) === false) {
        console.log(`${log4state('warn')} 请在 funpi 项目根目录下运行`);
        process.exit();
    }

    // 检测环境变量
    if (['development', 'production'].includes(process.env.NODE_ENV) === false) {
        console.log(`${log4state('warn')} 请正确设置 NODE_ENV 环境变量`);
        process.exit();
    }

    // 确保关键目录存在 ==================================================
    if (existsSync(resolve(appConfig.appDir, 'apis')) === false) {
        mkdirSync(resolve(appConfig.appDir, 'apis'));
    }
    if (existsSync(resolve(appConfig.appDir, 'config')) === false) {
        mkdirSync(resolve(appConfig.appDir, 'config'));
    }
    if (existsSync(resolve(appConfig.appDir, 'tables')) === false) {
        mkdirSync(resolve(appConfig.appDir, 'tables'));
    }
    if (existsSync(resolve(appConfig.appDir, 'plugins')) === false) {
        mkdirSync(resolve(appConfig.appDir, 'plugins'));
    }
    if (existsSync(resolve(appConfig.appDir, 'logs')) === false) {
        mkdirSync(resolve(appConfig.appDir, 'logs'));
    }
    if (existsSync(resolve(appConfig.appDir, 'public')) === false) {
        mkdirSync(resolve(appConfig.appDir, 'public'));
    }

    const ajv = new Ajv({
        strict: false,
        allErrors: true,
        verbose: false
    });

    // 验证配置文件 ==================================================
    // 路径
    const configPath = resolve(appConfig.funpiDir, 'app.js');
    const schemaPath = resolve(appConfig.funpiDir, 'schema', 'app.js');
    // 配置
    const configFile = await fnImport(configPath, 'appConfig', {});
    const configData = configFile['appConfig'];
    if (!configData) {
        console.log('app.js 配置文件无效');
        process.exit();
    }
    // 协议
    const schemaFile = await fnImport(schemaPath, 'appSchema', {});
    const schemaData = schemaFile['appSchema'];
    if (!schemaData) {
        console.log('app.js 验证文件无效');
        process.exit();
    }
    // 验证
    const validResult = ajv.validate(schemaData, configData);
    if (!validResult) {
        ajvZh(ajv.errors);
        console.log(log4state('error'), '[ ' + configPath + ' ] \n' + ajv.errorsText(ajv.errors, { separator: '\n' }));
        process.exit();
    }

    // ==================================================

    // 启动前验证
    if (process.env.MD5_SALT === 'funpi123456') {
        console.log(`${log4state('warn')} 请修改默认加密盐值！位置：process.env.MD5_SALT`);
    }

    if (existsSync(resolve(appConfig.appDir, 'funpi.js')) === false) {
        console.log(`${log4state('warn')} 请在 funpi 项目根目录下运行`);
        process.exit();
    }

    if (process.env.DEV_PASSWORD === 'funpi123456') {
        console.log(`${log4state('warn')} 请修改开发管理员密码！位置：process.env.DEV_PASSWORD`);
    }
};
