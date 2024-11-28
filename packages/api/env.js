export const envConfig = {
    development: {
        NODE_ENV: 'development',
        // mysql 配置
        MYSQL_HOST: '127.0.0.1',
        MYSQL_DB: 'yicode_bak',
        MYSQL_USERNAME: 'root',
        MYSQL_PASSWORD: 'root',
        // redis 配置
        REDIS_PASSWORD: '',
        // 上传配置
        LOCAL_DIR: './public/static',
        // 微信配置
        PAY_NOTIFY_URL: 'https://yicode.mynatapp.cc/api/weixin/payNotify'
    },
    production: {
        NODE_ENV: 'production',
        // mysql 配置
        MYSQL_HOST: '10.0.4.6',
        MYSQL_DB: 'yicode_tech',
        MYSQL_USERNAME: 'yicode_tech',
        MYSQL_PASSWORD: 'yicode_tech123456!@#',
        // redis 配置
        REDIS_PASSWORD: 'ca9e1e0f31ca5712854d57ce48d41383',
        // 上传配置
        LOCAL_DIR: '/wwwroot/yicode.tech/static2',
        // 微信配置
        PAY_NOTIFY_URL: 'https://api.yicode.tech/api/weixin/payNotify'
    }
}[process.env.NODE_ENV];
