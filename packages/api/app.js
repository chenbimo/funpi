export const appConfig = {
    // 应用名称
    appName: '易接口',
    // 加密盐
    md5Salt: 'funpi1234560',
    // 监听端口
    port: 3000,
    // 监听主机
    host: '127.0.0.1',
    // 超级管理员密码
    devPassword: 'funpi1234560',
    // 请求体大小 10M
    bodyLimit: 10,
    // 是否进行参数验证
    paramsCheck: false,
    // 是否显示接口文档
    isSwagger: false,
    // TODO: 考虑增加 uuid 类型以及不同的 uuid 格式
    // 数据库表主键方案 default（mysql 自带）time（时序 ID）
    tablePrimaryKey: 'default',
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
        secret: 'funpi1234560', // 密钥
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
        db: 'test', // 数据库名称
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
    // 缓存
    cache: {
        // 接口白名单列表
        apiWhiteLists: 'cacheData_apiWhiteLists'
    },
    http: {
        NO_FILE: { symbol: 'NO_FILE', code: 17, msg: '文件不存在2' },
        NO_API: { symbol: 'NO_API', code: 18, msg: '接口不存在2' },
        NO_USER: { symbol: 'NO_USER', code: 19, msg: '用户不存在2' },
        NO_DATA: { symbol: 'NO_DATA', code: 20, msg: '数据不存在2' }
    },
    // 定时器
    cron: [],
    // 角色配置
    role: {},
    // 菜单配置
    menu: {}
};