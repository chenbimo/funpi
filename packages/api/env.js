export const envConfig = {
    development: {
        NODE_ENV: 'development',
        // mysql 配置
        MYSQL_HOST: '127.0.0.1',
        MYSQL_DB: 'test',
        MYSQL_USERNAME: 'root',
        MYSQL_PASSWORD: 'root',
        // redis 配置
        REDIS_PASSWORD: '',
        // 上传配置
        LOCAL_DIR: './public/static',
        // 微信配置
        PAY_NOTIFY_URL: ''
    },
    production: {
        NODE_ENV: 'production',
        // mysql 配置
        MYSQL_HOST: '127.0.0.1',
        MYSQL_DB: 'test',
        MYSQL_USERNAME: 'root',
        MYSQL_PASSWORD: 'root',
        // redis 配置
        REDIS_PASSWORD: '',
        // 上传配置
        LOCAL_DIR: './public/static',
        // 微信配置
        PAY_NOTIFY_URL: ''
    }
}[process.env.NODE_ENV];
