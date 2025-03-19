export const appSchema = {
    title: '应用基本配置',
    type: 'object',
    properties: {
        APP_NAME: {
            title: '应用名称',
            type: 'string',
            minLength: 1,
            maxLength: 50
        },
        MD5_SALT: {
            title: 'MD5加密盐值',
            type: 'string',
            minLength: 1,
            maxLength: 300
        },
        APP_PORT: {
            title: '监听端口',
            type: 'integer',
            minimum: 0
        },
        LISTEN_HOST: {
            title: '监听主机',
            type: 'string',
            minLength: 1,
            maxLength: 30
        },
        DEV_PASSWORD: {
            title: '开发者密码',
            type: 'string',
            minLength: 6,
            maxLength: 20
        },
        BODY_LIMIT: {
            title: '请求体大小限制',
            type: 'integer'
        },
        PARAMS_CHECK: {
            title: '接口参数验证',
            type: 'string',
            default: '0',
            enum: ['0', '1']
        },
        SWAGGER: {
            title: '是否开启接口文档',
            type: 'string',
            default: '0',
            enum: ['0', '1']
        },
        // 数据库表主键方案
        TABLE_PRIMARY_KEY: {
            title: '数据库表主键方案',
            type: 'string',
            enum: ['default', 'time']
        },
        TIMEZONE: {
            title: '时区',
            type: 'string',
            default: 'Asia/Shanghai'
        },
        // 数据库配置
        MYSQL_HOST: {
            title: '数据库地址',
            type: 'string',
            default: '127.0.0.1'
        },
        MYSQL_PORT: {
            title: '数据库地址',
            type: 'integer',
            default: 3306
        },
        MYSQL_DB: {
            title: '数据库名称',
            type: 'string',
            default: 'funpi_demo'
        },
        MYSQL_USERNAME: {
            title: '数据库用户名',
            type: 'string',
            default: 'root'
        },
        MYSQL_PASSWORD: {
            title: '数据库密码',
            type: 'string',
            default: 'root'
        },
        // Redis配置
        REDIS_HOST: {
            title: 'Redis地址',
            type: 'string',
            default: '127.0.0.1'
        },
        REDIS_PORT: {
            title: 'Redis端口',
            type: 'integer',
            default: 6379
        },
        REDIS_USERNAME: {
            title: 'Redis用户名',
            type: 'string',
            default: ''
        },
        REDIS_PASSWORD: {
            title: 'Redis密码',
            type: 'string',
            default: ''
        },
        REDIS_DB: {
            title: 'Redis数据库',
            type: 'integer',
            default: 0
        },
        REDIS_KEY_PREFIX: {
            title: 'Redis键前缀',
            type: 'string',
            default: 'funpi_demo:'
        },
        // JWT配置
        JWT_SECRET: {
            title: 'JWT密钥',
            type: 'string',
            default: 'funpi123456'
        },
        JWT_EXPIRES_IN: {
            title: 'JWT过期时间',
            type: 'string',
            default: '30d'
        },
        JWT_ALGORITHM: {
            title: 'JWT算法',
            type: 'string',
            default: 'HS256'
        },
        // 邮件配置
        MAIL_HOST: {
            title: '邮件地址',
            type: 'string',
            default: ''
        },
        MAIL_PORT: {
            title: '邮件端口',
            type: 'integer',
            default: 465
        },
        MAIL_POOL: {
            title: '邮件池',
            type: 'string',
            default: '1',
            enum: ['0', '1']
        },
        MAIL_SECURE: {
            title: '邮件安全',
            type: 'string',
            default: '1',
            enum: ['0', '1']
        },
        MAIL_USER: {
            title: '邮件用户',
            type: 'string',
            default: 'funpi_demo@qq.com'
        },
        MAIL_PASS: {
            title: '邮件密码',
            type: 'string',
            default: ''
        },
        MAIL_SENDER: {
            title: '发件人',
            type: 'string',
            default: ''
        },
        MAIL_ADDRESS: {
            title: '发件地址',
            type: 'string',
            default: ''
        }
    },
    additionalProperties: false,
    required: [
        // 应用名称
        'APP_NAME',
        // 加密盐
        'MD5_SALT',
        // 监听端口
        'APP_PORT',
        // 监听主机
        'LISTEN_HOST',
        // 超级管理员密码
        'DEV_PASSWORD',
        // 请求体大小 10M
        'BODY_LIMIT',
        // 是否进行参数验证
        'PARAMS_CHECK',
        // 是否显示接口文档
        'SWAGGER',
        // 数据库表主键方案
        'TABLE_PRIMARY_KEY',
        // 时区
        'TIMEZONE',
        // 数据库配置
        'MYSQL_HOST',
        'MYSQL_PORT',
        'MYSQL_DB',
        'MYSQL_USERNAME',
        'MYSQL_PASSWORD',
        // Redis配置
        'REDIS_HOST',
        'REDIS_PORT',
        'REDIS_USERNAME',
        'REDIS_PASSWORD',
        'REDIS_DB',
        'REDIS_KEY_PREFIX',
        // JWT配置
        'JWT_SECRET',
        'JWT_EXPIRES_IN',
        'JWT_ALGORITHM',
        // 邮件配置
        'MAIL_HOST',
        'MAIL_PORT',
        'MAIL_POOL',
        'MAIL_SECURE',
        'MAIL_USER',
        'MAIL_PASS',
        'MAIL_SENDER',
        'MAIL_ADDRESS'
    ]
};
