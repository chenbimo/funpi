import { resolve } from 'node:path';
import { yd_object_merge } from 'yidash';
import { fnImport } from '../utils/fnImport.js';
import { system } from '../system.js';

const absolutePath = resolve(system.appDir, 'config', 'app.js');
const { appConfig: importConfig } = await fnImport(absolutePath, 'appConfig', {});

// 合并对象
const targetObject = {
    // 应用名称
    appName: '易接口',
    // 加密盐
    md5Salt: 'yiapi123456',
    // 监听端口
    port: 3000,
    // 监听主机
    host: '127.0.0.1',
    // 超级管理员密码
    devPassword: 'yiapi123456',
    // 是否进行参数验证
    paramsCheck: false,
    // 是否显示接口文档
    isSwagger: false,
    // TODO: 考虑增加 uuid 类型以及不同的 uuid 格式
    // 数据库表主键方案 default（mysql 自带）time（时序 ID）
    tablePrimaryKey: 'default',
    // 白名单API列表,
    whiteApis: [],
    // 黑名单API列表
    blackApis: [],
    // 无限制API列表
    freeApis: [],
    // 请求限制
    rate: {},
    // jwt 配置
    jwt: {
        secret: 'yiapi123456', // 密钥
        expiresIn: '7d' // 过期时间
    },
    // 邮件配置
    mail: {
        host: 'demo.com',
        port: 465,
        pool: true,
        secure: true,
        // qq 邮箱
        user: 'demo@qq.com',
        pass: '',
        from_name: '易接口',
        from_email: 'demo@qq.com'
    },
    // mysql 数据库配置
    mysql: {
        host: '127.0.0.1', // 主机地址
        port: 3306, // 端口
        db: 'test3', // 数据库名称
        username: 'root', // 数据库用户名
        password: 'root' // 数据库密码
    },
    // redis 缓存配置
    redis: {
        host: '127.0.0.1',
        port: 6379,
        username: '',
        password: '',
        db: 0,
        keyPrefix: 'test:'
    },
    // 定时器
    cron: []
};

// 覆盖对象
const replaceObj = {
    // 缓存 key映射
    cache: {
        // 角色缓存
        role: 'cacheData:role',
        // 菜单缓存
        menu: 'cacheData:menu',
        // 接口缓存
        api: 'cacheData:api',
        // 接口名称缓存
        apiNames: 'cacheData:apiNames',
        // 接口白名单列表
        apiWhiteLists: 'cacheData:apiWhiteLists'
    },
    // Http 状态码
    http: {
        SUCCESS: { symbol: 'SUCCESS', code: 0, msg: '操作成功' },
        INSERT_SUCCESS: { symbol: 'INSERT_SUCCESS', code: 0, msg: '添加成功' },
        SELECT_SUCCESS: { symbol: 'SELECT_SUCCESS', code: 0, msg: '查询成功' },
        UPDATE_SUCCESS: { symbol: 'UPDATE_SUCCESS', code: 0, msg: '更新成功' },
        DELETE_SUCCESS: { symbol: 'DELETE_SUCCESS', code: 0, msg: '删除成功' },
        FAIL: { symbol: 'FAIL', code: 1, msg: '操作失败' },
        INSERT_FAIL: { symbol: 'INSERT_FAIL', code: 1, msg: '添加失败' },
        SELECT_FAIL: { symbol: 'SELECT_FAIL', code: 1, msg: '查询失败' },
        UPDATE_FAIL: { symbol: 'UPDATE_FAIL', code: 1, msg: '更新失败' },
        DELETE_FAIL: { symbol: 'DELETE_FAIL', code: 1, msg: '删除失败' },
        INFO: { symbol: 'INFO', code: 11, msg: '提示' },
        WARN: { symbol: 'WARN', code: 12, msg: '警告' },
        ERROR: { symbol: 'ERROR', code: 13, msg: '错误' },
        NOT_LOGIN: { symbol: 'NOT_LOGIN', code: 14, msg: '未登录' },
        API_DISABLED: { symbol: 'API_DISABLED', code: 15, msg: '接口已禁用' },
        NO_FILE: { symbol: 'NO_FILE', code: 17, msg: '文件不存在' },
        NO_API: { symbol: 'NO_API', code: 18, msg: '接口不存在' },
        NO_USER: { symbol: 'NO_USER', code: 19, msg: '用户不存在' },
        NO_DATA: { symbol: 'NO_DATA', code: 20, msg: '数据不存在' }
    },
    // 角色配置
    role: {
        visitor: {
            name: '游客',
            describe: '具备有限的权限和有限的查看内容',
            is_system: 1
        },
        user: {
            name: '用户',
            describe: '用户权限和对于的内容查看',
            is_system: 1
        },
        admin: {
            name: '管理',
            describe: '管理权限、除开发相关权限之外的权限等',
            is_system: 1
        },
        super: {
            name: '超级管理',
            describe: '超级管理权限、除开发相关权限之外的权限等',
            is_system: 1
        }
    },
    // 菜单配置
    menu: {
        '/home': {
            name: '首页数据',
            sort: 1,
            is_system: 1,
            children: {
                '/internal/home': {
                    name: '首页',
                    is_system: 1,
                    sort: 1
                }
            }
        },
        '/admin': {
            name: '管理数据',
            sort: 1001,
            is_system: 1,
            children: {
                '/internal/admin': {
                    name: '管理员',
                    is_system: 1,
                    sort: 2
                }
            }
        },
        '/permission': {
            name: '权限数据',
            sort: 1003,
            children: {
                '/internal/menu': {
                    name: '菜单列表',
                    is_system: 1,
                    sort: 1
                },
                '/internal/api': {
                    name: '接口列表',
                    is_system: 1,
                    sort: 2
                },
                '/internal/role': {
                    name: '角色管理',
                    is_system: 1,
                    sort: 5
                }
            }
        }
    }
};
const appConfig = yd_object_merge(targetObject, yd_object_merge(importConfig, replaceObj));

export { appConfig };
