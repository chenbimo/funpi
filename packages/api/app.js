import { envConfig } from './env.js';
export const appConfig = {
    // 应用名称
    appName: '易接口',
    // 加密盐
    md5Salt: 'funpi123456',
    // 监听端口
    port: 3000,
    // 监听主机
    host: '127.0.0.1',
    // 超级管理员密码
    devPassword: 'funpi123456',
    // 请求体大小 10M
    bodyLimit: 10,
    // 是否进行参数验证
    paramsCheck: false,
    // 是否显示接口文档
    isSwagger: false,
    // 无限制API列表
    freeApis: ['/', '/favicon.*', '/public/**', '/api/admin/adminLogin'],
    // 白名单API列表,
    whiteApis: [],
    // 黑名单API列表
    blackApis: [],
    // 请求限制
    rate: {},
    // jwt 配置
    jwt: {
        secret: 'funpi123456', // 密钥
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
        host: envConfig.MYSQL_HOST, // 主机地址
        port: 3306, // 端口
        db: envConfig.MYSQL_DB, // 数据库名称
        username: envConfig.MYSQL_USERNAME, // 数据库用户名
        password: envConfig.MYSQL_PASSWORD // 数据库密码
    },
    // redis 缓存配置
    redis: {
        host: '127.0.0.1',
        port: 6379,
        username: '',
        password: envConfig.REDIS_PASSWORD,
        db: 0,
        keyPrefix: 'funpidemo:'
    },
    // 状态码
    http: {},
    // 定时器
    cron: [],
    // 角色配置
    role: {},
    // 菜单配置
    menu: {}
};
