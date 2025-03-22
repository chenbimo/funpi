import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, basename, resolve } from 'node:path';
import { readdirSync } from 'node:fs';
import { cwd, env, platform } from 'node:process';
import { randomInt, createHash, createHmac } from 'node:crypto';

import { isString as es_isString, isFunction as es_isFunction, omit as es_omit } from 'es-toolkit';
import { isObject as es_isObject } from 'es-toolkit/compat';
import { configure } from 'safe-stable-stringify';
import { colors } from './colors.js';
import { appDir, funpiDir } from '../config/path.js';

// 字段协议映射
const tableFieldSchemaMap = {
    // 字符串型
    string: 'string',
    // 文本型
    mediumText: 'string',
    text: 'string',
    bigText: 'string',
    // 整型
    tinyInt: 'integer',
    smallInt: 'integer',
    mediumInt: 'integer',
    int: 'integer',
    bigInt: 'integer',
    // 浮点型
    float: 'number',
    // 双精度型
    double: 'number'
};

const safeStableStringify = configure({
    bigint: true,
    deterministic: false,
    maximumDepth: 3
});

export const isUnicodeSupported = () => {
    const { TERM, TERM_PROGRAM } = env;

    if (platform !== 'win32') {
        return TERM !== 'linux'; // Linux console (kernel)
    }

    return (
        Boolean(env.WT_SESSION) || // Windows Terminal
        Boolean(env.TERMINUS_SUBLIME) || // Terminus (<0.2.27)
        env.ConEmuTask === '{cmd::Cmder}' || // ConEmu and cmder
        TERM_PROGRAM === 'Terminus-Sublime' ||
        TERM_PROGRAM === 'vscode' ||
        TERM === 'xterm-256color' ||
        TERM === 'alacritty' ||
        TERM === 'rxvt-unicode' ||
        TERM === 'rxvt-unicode-256color' ||
        env.TERMINAL_EMULATOR === 'JetBrains-JediTerm'
    );
};
export const log4state = (state) => {
    if (state === 'info') {
        return colors.blue('i');
    }
    if (state === 'success') {
        return colors.green('√');
    }
    if (state === 'warn') {
        return colors.yellow('‼');
    }
    if (state === 'error') {
        return colors.red('x');
    }
};

// 数据清洗
export const fnDataClear = (data, excludeKeys = [], includeKeys = [], maxLen = 500, removeValues = [null, undefined]) => {
    const data2 = {};
    for (let key in data) {
        if (
            //
            Object.prototype.hasOwnProperty.call(data, key) &&
            excludeKeys.includes(key) === false &&
            removeValues.includes(data[key]) === false
        ) {
            if (includeKeys.length > 0) {
                if (includeKeys.includes(key)) {
                    const strValue = safeStableStringify(data[key]);
                    if (strValue?.length > maxLen) {
                        data2[key] = strValue?.substring(0, maxLen);
                    } else {
                        data2[key] = data[key];
                    }
                }
            } else {
                const strValue = safeStableStringify(data[key]);
                if (strValue?.length > maxLen) {
                    data2[key] = strValue?.substring(0, maxLen);
                } else {
                    data2[key] = data[key];
                }
            }
        }
    }
    return data2;
};

export const fnRequestLog = (req) => {
    return {
        user_id: req.session.id,
        username: req.session.username,
        nickname: req.session.nickname,
        role: req.session.role,
        ip: req.ip,
        ua: req.headers['user-agent'],
        api: req.routeOptions.url,
        params: JSON.stringify(req.body)
    };
};

export const fnFormatNow = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

//  检查传参有效性
export const fnApiCheck = (req) => {
    return new Promise((resolve, reject) => {
        const fieldsParams = es_omit(req.body, ['sign']);

        if (Object.keys(fieldsParams).length === 0) {
            return resolve({ code: 0, msg: '接口未带参数' });
        }

        if (!fieldsParams?.t) {
            return reject({ code: 1, msg: '接口请求时间无效' });
        }

        const diffTime = Date.now() - Number(fieldsParams.t);
        if (diffTime > 3 * 60 * 1000) {
            return reject({ code: 1, msg: '接口请求时间已过期' });
        }

        const fieldsArray = [];
        for (let key in fieldsParams) {
            if (Object.prototype.hasOwnProperty.call(fieldsParams, key)) {
                const value = fieldsParams[key];
                if (value !== undefined && value !== null) {
                    fieldsArray.push(`${key}=${value}`);
                }
            }
        }

        const fieldsSort = fieldsArray.sort().join('&');

        const fieldsMd5 = fnCryptoMD5(fieldsSort);

        if (fieldsMd5 !== req.body.sign) {
            return reject({
                code: 1,
                msg: '接口请求参数校验失败',
                detail: { sign: fieldsMd5, sort: fieldsSort }
            });
        }

        return resolve({ code: 0, msg: '接口参数正常' });
    });
};

// 获取接口信息
export const fnApiInfo = (metaUrl) => {
    const _filename = fileURLToPath(metaUrl);
    const _dirname = dirname(_filename);

    const pureFileName = basename(_filename, '.js');

    const parentDirName = _dirname.replace(/\\+/gi, '/').replace(/.+\/apis/, '');

    // const metaFile = dirname(metaUrl) + '/_meta.js';

    const apiData = {
        pureFileName: pureFileName,
        parentDirName: parentDirName,
        apiPath: [parentDirName, pureFileName].join('/')
    };

    return apiData;
};

// 获取数据库字段
export const fnField = (tableData, exclude = []) => {
    const defaultFields = ['id', 'created_at', 'updated_at', 'deleted_at'];
    const selectFields = Object.keys(tableData).filter((field) => {
        const isPass = !exclude.includes(field);
        return isPass;
    });
    return [...defaultFields, ...selectFields];
};

// 导入数据
export const fnImport = async (filePath, name, defaultValue = {}) => {
    try {
        const data = await import(filePath.startsWith('file://') ? filePath : pathToFileURL(filePath));
        return data;
    } catch (err) {
        console.log('🚀 ~ fnImport ~ err:', err);
        return {
            [name]: defaultValue
        };
    }
};

// 设置路由函数
export const fnRoute = async (metaUrl, fastify, options) => {
    if (es_isString(metaUrl) === false) {
        console.log(`${log4state('error')} ${colors.blue(metaUrl)} 接口的 fnRoute 函数第一个参数必须为 import.meta.url，请检查`);
        process.exit();
    }

    if (es_isObject(fastify) === false) {
        console.log(`${log4state('error')} ${colors.blue(metaUrl)} 接口的 fnRoute 函数第二个参数必须为 fastify 实例，请检查`);
        process.exit();
    }

    if (es_isObject(options) === false) {
        console.log(`${log4state('error')} ${colors.blue(metaUrl)} 接口的 fnRoute 函数第三个参数必须为 Object 对象，请检查`);
        process.exit();
    }

    if (es_isString(options.apiName) === false) {
        console.log(`${log4state('error')} ${colors.blue(metaUrl)} 接口的 apiName 必须为一个字符串，请检查`);
        process.exit();
    }

    if (es_isObject(options.schemaRequest) === false) {
        console.log(`${log4state('error')} ${colors.blue(metaUrl)} 接口的 schemaRequest 必须为一个对象，请检查`);
        process.exit();
    }
    if (es_isFunction(options.apiHandler) === false) {
        console.log(`${log4state('error')} ${colors.blue(metaUrl)} 接口的 apiHandler 必须为一个函数，请检查`);
        process.exit();
    }

    const apiInfo = fnApiInfo(metaUrl);
    const method = (options.method || 'post').toLowerCase();

    if (['get', 'post'].includes(method) === false) {
        console.log(`${log4state('error')} ${colors.blue(metaUrl)} 接口方法只能为 get 或 post 之一，请检查`);
        process.exit();
    }

    options.schemaRequest.title = options.apiName;

    const routeParams = {
        method: method,
        url: `/${apiInfo.pureFileName}`,
        schema: {
            summary: options.apiName,
            tags: [apiInfo.parentDirName],
            response: options.schemaResponse || {}
        },
        handler: options.apiHandler
    };

    if (routeParams.method === 'get') {
        routeParams.schema.query = options.schemaRequest;
    } else {
        routeParams.schema.body = options.schemaRequest;
    }
    fastify.route(routeParams);
};

export const fnIsCamelCase = (str) => {
    if (!str || typeof str !== 'string') return false;

    // 快速检查首字符 (避免正则开销)
    if (str[0] < 'a' || str[0] > 'z') return false;

    // 然后用简单正则检查整个字符串
    return /^[a-z][a-zA-Z0-9]*$/.test(str);
};
export const fnApiFilter = (dirent) => {
    const isFile = dirent.isFile();
    const isJs = dirent.name.endsWith('.js');
    const isFileCamelCase = fnIsCamelCase(dirent.name.replace('.js', ''));
    const isDirCameCase = fnIsCamelCase(basename(dirent.parentPath));
    const isApisDir = basename(dirname(dirent.parentPath)) === 'apis';
    if (isFile) {
        const fileColorPath = colors.blue(dirent.parentPath + '/' + dirent.name);
        if (!isApisDir) {
            console.log(`${log4state('error')} ${fileColorPath} 接口文件必须为 [目录/接口] 2个层级，请检查`);
        }
        if (!isJs) {
            console.log(`${log4state('error')} ${fileColorPath} 接口文件必须为 .js 文件，请检查`);
        }
        if (!isDirCameCase) {
            console.log(`${log4state('error')} ${fileColorPath} 接口目录必须为小驼峰格式，请检查`);
        }
        if (!isFileCamelCase) {
            console.log(`${log4state('error')} ${fileColorPath} 接口文件必须为小驼峰格式，请检查`);
        }
    }
    return isFile && isJs && isFileCamelCase && isApisDir && isDirCameCase;
};
export const fnApiFiles = async () => {
    // 验证接口层级
    const funpiApiFiles = readdirSync(resolve(funpiDir, 'apis'), { recursive: true, withFileTypes: true })
        .filter((dirent) => fnApiFilter(dirent))
        .map((file) => {
            return {
                where: 'funpi',
                dirPath: file.parentPath,
                filePath: file.name,
                dirName: `/${basename(file.parentPath)}`,
                fileName: `/funpi/${basename(file.parentPath)}/${file.name.replace('.js', '')}`
            };
        });

    const appApiFiles = readdirSync(resolve(appDir, 'apis'), { recursive: true, withFileTypes: true })
        .filter((dirent) => fnApiFilter(dirent))
        .map((file) => {
            return {
                where: 'app',
                dirPath: file.parentPath,
                filePath: file.name,
                dirName: `/${basename(file.parentPath)}`,
                fileName: `/app/${basename(file.parentPath)}/${file.name.replace('.js', '')}`
            };
        });

    const allApiFiles = [...funpiApiFiles, ...appApiFiles];
    return allApiFiles;
};

export const fnSchema = (field) => {
    if (!field) {
        throw new Error('字段格式错误');
    }
    if (field === 'id') {
        field = {
            name: '主键ID',
            type: 'bigInt',
            min: 1
        };
    }
    if (field === 'page') {
        field = {
            name: '第几页',
            type: 'bigInt',
            default2: 1,
            min: 1
        };
    }
    if (field === 'limit') {
        field = {
            name: '每页数量',
            type: 'bigInt',
            default2: 20,
            min: 1,
            max: 100
        };
    }
    if (field === 'keyword') {
        field = {
            name: '搜索关键字',
            type: 'string',
            default2: '',
            min: 0,
            max: 100
        };
    }
    if (field === 'bool_enum') {
        field = {
            name: '布尔值',
            type: 'tinyInt',
            enum: [0, 1]
        };
    }
    if (field === 'min1') {
        field = {
            name: '最小数字为1',
            type: 'bigInt',
            min: 1
        };
    }
    if (field === 'min0') {
        field = {
            name: '最小数字为0',
            type: 'bigInt',
            min: 0
        };
    }
    const params = {
        title: field.name,
        type: tableFieldSchemaMap[field.type]
    };
    if (params.type === 'string') {
        if (field.default2 !== undefined) {
            params.default = field.default2;
        }
        if (field.min !== undefined) {
            params.minLength = field.min;
        }
        if (field.max !== undefined) {
            params.maxLength = field.max;
        }
        if (field.enum !== undefined) {
            params.enum = field.enum;
        }
        if (field.pattern !== undefined) {
            params.pattern = field.pattern;
        }
    }
    if (params.type === 'integer' || params.type === 'number') {
        if (field.default2 !== undefined) {
            params.default = field.default2;
        }
        if (field.min !== undefined) {
            params.minimum = field.min;
        }
        if (field.max !== undefined) {
            params.maximum = field.max;
        }
        if (field.enum !== undefined) {
            params.enum = field.enum;
        }
        if (field.multipleOf !== undefined) {
            params.multipleOf = field.multipleOf;
        }
    }

    return params;
};

// 自增ID
export const fnIncrTimeID = () => {
    const timestamp = Math.floor(Date.now() / 1000);
    const random = randomInt(100000, 999999);
    return Number(`${timestamp}${random}`);
};

export const fnCryptoMD5 = (data, encoding = 'hex') => {
    const result = createHash('md5').update(data).digest(encoding);
    return result;
};

export const fnCryptoHmacMD5 = (data, key, encoding = 'hex') => {
    const result = createHmac('md5', key).update(data).digest(encoding);
    return result;
};

// 两个数组是否至少有一个相同值
export const fnArrayContain = (arr1, arr2) => {
    return arr1.some((element) => arr2.includes(element));
};

// 数组的差集
export const fnArrayDiffBoth = (arr1, arr2) => {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);

    // 创建两个数组的对称差集
    const uniqueElements = [];

    for (const item of set1) {
        if (!set2.has(item)) {
            uniqueElements.push(item);
        }
    }
    for (const item of set2) {
        if (!set1.has(item)) {
            uniqueElements.push(item);
        }
    }

    return uniqueElements;
};

// 添加一个辅助函数，用于验证全局路径唯一性
export const fnCheckMenuConfig = (menuConfig) => {
    const paths = new Set();

    for (const menu of menuConfig) {
        // 检查主菜单路径
        if (paths.has(menu.path)) {
            throw new Error(`重复的菜单路径: ${menu.path}`);
        }
        paths.add(menu.path);

        // 检查子菜单路径
        for (const child of menu.children) {
            if (paths.has(child.path)) {
                throw new Error(`重复的菜单路径: ${child.path}`);
            }
            paths.add(child.path);
        }
    }

    return true;
};
