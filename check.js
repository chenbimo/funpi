// 内核模块
import { resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
// 外部模块
import Ajv from 'ajv';
import localize from 'ajv-i18n';
import { yd_misc_4StateSymbol } from 'yidash';

// 内部模块
import { system } from './system.js';

// 配置文件
import { appConfig } from './config/app.js';
// 协议配置
// 工具函数
import { fnImport } from './utils/fnImport.js';

// 判断运行目录下是否有 yiapi.js 文件
if (existsSync(resolve(system.appDir, 'yiapi.js')) === false) {
    console.log(`${yd_misc_4StateSymbol('warn')} 请在 yiapi 项目根目录下运行`);
    process.exit();
}

// 检测环境变量
if (['development', 'production'].includes(process.env.NODE_ENV) === false) {
    console.log(`${yd_misc_4StateSymbol('warn')} 请正确设置 NODE_ENV 环境变量`);
    process.exit();
}

// 确保关键目录存在 ==================================================
if (existsSync(resolve(system.appDir, 'apis')) === false) {
    mkdirSync(resolve(system.appDir, 'apis'));
}
if (existsSync(resolve(system.appDir, 'config')) === false) {
    mkdirSync(resolve(system.appDir, 'config'));
}
if (existsSync(resolve(system.appDir, 'tables')) === false) {
    mkdirSync(resolve(system.appDir, 'tables'));
}
if (existsSync(resolve(system.appDir, 'plugins')) === false) {
    mkdirSync(resolve(system.appDir, 'plugins'));
}
if (existsSync(resolve(system.appDir, 'logs')) === false) {
    mkdirSync(resolve(system.appDir, 'logs'));
}
if (existsSync(resolve(system.appDir, 'public')) === false) {
    mkdirSync(resolve(system.appDir, 'public'));
}

const ajv = new Ajv({
    strict: false,
    allErrors: true,
    verbose: true
});

// 验证配置文件 ==================================================
// 路径
const configPath = resolve(system.yiapiDir, 'config', 'app.js');
const schemaPath = resolve(system.yiapiDir, 'schema', 'app.js');
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
    localize.zh(ajv.errors);
    console.log(yd_misc_4StateSymbol('error'), '[ ' + configPath + ' ] \n' + ajv.errorsText(ajv.errors, { separator: '\n' }));
    process.exit();
}

// ==================================================

if (appConfig.devPassword === 'yiapi123456') {
    // 启动前验证
    console.log(`${yd_misc_4StateSymbol('warn')} 请修改超级管理员密码！！！（位置：appConfig.devPassword）`);
    process.exit();
}

// 启动前验证
if (appConfig.md5Salt === 'yiapi123456') {
    console.log(`${yd_misc_4StateSymbol('warn')} 请修改默认加密盐值！！！（位置：appConfig.md5Salt`);
    process.exit();
}

// jwt密钥验证
if (appConfig.jwt.secret === 'yiapi123456') {
    console.log(`${yd_misc_4StateSymbol('warn')} 请修改jwt默认密钥！！！（位置：appConfig.jwt.secret`);
    process.exit();
}
