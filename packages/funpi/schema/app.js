export const appSchema = {
    title: '应用基本配置',
    type: 'object',
    properties: {
        appName: {
            title: '应用名称',
            type: 'string',
            minLength: 1,
            maxLength: 50
        },
        md5Salt: {
            title: 'MD5加密盐值',
            type: 'string',
            minLength: 1,
            maxLength: 300
        },
        port: {
            title: '监听端口',
            type: 'integer',
            minimum: 0
        },
        host: {
            title: '监听主机',
            type: 'string',
            minLength: 1,
            maxLength: 30
        },
        devPassword: {
            title: '开发者密码',
            type: 'string',
            minLength: 6,
            maxLength: 20
        },
        bodyLimit: {
            title: '请求体大小限制',
            type: 'integer'
        },
        paramsCheck: {
            title: '接口参数验证',
            type: 'boolean',
            default: false
        },
        isSwagger: {
            title: '是否开启接口文档',
            type: 'boolean',
            default: false
        },
        // 数据库表主键方案
        tablePrimaryKey: {
            title: '数据库表主键方案',
            type: 'string',
            enum: ['default', 'time']
        },
        // 自由接口列表，任何情况下可以访问的路由
        freeApis: {
            title: '自由接口',
            type: 'array',
            items: {
                type: 'string'
            },
            uniqueItems: true
        },
        // 白名单接口列表，登录后访问无限制
        whiteApis: {
            title: '白名单接口',
            type: 'array',
            items: {
                type: 'string'
            },
            uniqueItems: true
        },
        // 黑名单接口列表，不可访问的接口
        blackApis: {
            title: '黑名单接口',
            type: 'array',
            items: {
                type: 'string'
            },
            uniqueItems: true
        },
        // 请求限制
        rate: {
            title: '请求频率',
            type: 'object',
            properties: {
                global: {
                    type: 'boolean',
                    title: '是否影响全部的路由'
                },
                max: {
                    type: 'number',
                    title: '限制时间内的最大请求数'
                },
                timeWindow: {
                    type: 'number',
                    title: '限制时间'
                },
                hook: {
                    type: 'string',
                    title: '触发的钩子'
                },
                cache: {
                    type: 'number',
                    title: '内存缓存大小'
                },
                allowList: {
                    type: 'array',
                    title: '白名单'
                }
            },
            additionalProperties: false
        },
        // 邮件配置
        mail: {
            // 邮件配置
            title: '邮件配置',
            type: 'object',
            properties: {
                host: {
                    title: '主机地址',
                    type: 'string'
                },
                port: {
                    title: '端口',
                    type: 'number'
                },
                pool: {
                    title: '是否开启连接池',
                    type: 'boolean'
                },
                secure: {
                    title: '是否开启 https',
                    type: 'boolean'
                },
                user: {
                    title: '账号',
                    type: 'string'
                },
                pass: {
                    title: '密码',
                    type: 'string'
                },
                from_name: {
                    title: '发送者昵称',
                    type: 'string'
                },
                from_email: {
                    title: '发送者邮箱',
                    type: 'string'
                }
            },
            additionalProperties: false,
            required: [
                //
                'host',
                'port',
                'pool',
                'secure',
                'user',
                'pass',
                'from_name',
                'from_email'
            ]
        },
        // jwt 认证
        jwt: {
            title: 'jwt 配置',
            type: 'object',
            properties: {
                secret: {
                    title: '加密字符',
                    type: 'string'
                },
                expiresIn: {
                    title: '过期时间',
                    type: 'string'
                }
            },
            additionalProperties: false,
            required: [
                //
                'secret',
                'expiresIn'
            ]
        },
        // mysql 配置
        mysql: {
            title: '数据库配合',
            type: 'object',
            properties: {
                db: {
                    title: '数据库名称',
                    type: 'string'
                },
                username: {
                    title: '用户名',
                    type: 'string'
                },
                password: {
                    title: '密码',
                    type: 'string'
                },
                host: {
                    title: '主机地址',
                    type: 'string'
                },
                port: {
                    title: '监听端口',
                    type: 'number'
                }
            },
            additionalProperties: false,
            required: [
                //
                'db',
                'username',
                'password',
                'host',
                'port'
            ]
        },
        // redis 缓存
        redis: {
            title: '缓存配置',
            type: 'object',
            properties: {
                keyPrefix: {
                    title: '缓存前缀',
                    type: 'string'
                },
                username: {
                    title: '用户名',
                    type: 'string'
                },
                password: {
                    title: '连接密码',
                    type: 'string'
                },
                host: {
                    title: '主机地址',
                    type: 'string'
                },
                db: {
                    title: '库序号',
                    type: 'number'
                },
                port: {
                    title: '监听端口',
                    type: 'number'
                }
            },
            additionalProperties: false,
            required: [
                //
                'keyPrefix',
                'username',
                'password',
                'db',
                'host',
                'port'
            ]
        },
        // 定时器
        cron: {
            // 定时器配置
            title: '定时器',
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    timer: {
                        title: '定时器',
                        type: 'string'
                    },
                    name: {
                        title: '定时器名称',
                        type: 'string'
                    },
                    code: {
                        title: '定时器代号',
                        type: 'string'
                    },
                    maxRuns: {
                        title: '最大运行次数',
                        type: 'number'
                    },
                    timezone: {
                        title: '时区',
                        type: 'string'
                    },
                    handler: {
                        title: '处理函数'
                    }
                },
                additionalProperties: false,
                required: ['timer', 'handler', 'name', 'code']
            }
        },
        // 缓存配置
        cache: {
            title: '缓存名称配置',
            type: 'object',
            patternProperties: {
                '^[a-z][a-zA-Z0-9_]*$': {
                    title: '缓存名称',
                    type: 'string'
                }
            },
            additionalProperties: false
        },
        // http 状态码
        http: {
            title: 'HTTP返回码',
            type: 'object',
            properties: {
                '*': {
                    title: '任意字段',
                    type: 'object',
                    properties: {
                        symbol: {
                            title: '唯一符号',
                            type: 'string'
                        },
                        code: {
                            title: '状态码',
                            type: 'integer',
                            minimum: 0
                        },
                        msg: {
                            title: '消息内容',
                            type: 'string'
                        }
                    },
                    additionalProperties: false,
                    required: ['symbol', 'code', 'msg']
                }
            }
        },
        // 角色配置
        role: {
            title: '角色配置',
            type: 'object',
            patternProperties: {
                '^[a-z][a-z0-9_]*$': {
                    title: '角色代号',
                    type: 'object',
                    properties: {
                        name: {
                            title: '角色名称',
                            type: 'string',
                            minLength: 1,
                            maxLength: 20
                        },
                        describe: {
                            title: '角色描述',
                            type: 'string',
                            minLength: 0,
                            maxLength: 200
                        },
                        is_system: {
                            title: '是否系统角色',
                            type: 'integer',
                            default: 0,
                            enum: [0, 1]
                        }
                    },
                    additionalProperties: false,
                    required: ['name', 'describe']
                }
            },
            additionalProperties: false
        },
        // 菜单配置
        menu: {
            title: '菜单字段',
            type: 'object',
            patternProperties: {
                '^\\/[a-z][a-z0-9\\/-]*$': {
                    title: '主菜单',
                    type: 'object',
                    properties: {
                        name: {
                            title: '菜单名称',
                            type: 'string'
                        },
                        is_system: {
                            title: '是否系统菜单',
                            type: 'integer',
                            enum: [0, 1]
                        },
                        sort: {
                            title: '菜单排序',
                            type: 'integer',
                            minimum: 1,
                            maximum: 9999
                        },
                        children: {
                            title: '子菜单',
                            type: 'object',
                            patternProperties: {
                                '^\\/[a-z][a-z0-9\\/-]*$': {
                                    type: 'object',
                                    properties: {
                                        name: {
                                            title: '菜单名称',
                                            type: 'string'
                                        },
                                        sort: {
                                            title: '菜单排序',
                                            type: 'integer',
                                            minimum: 1,
                                            maximum: 9999
                                        },
                                        is_system: {
                                            title: '是否系统菜单',
                                            type: 'integer',
                                            enum: [0, 1]
                                        }
                                    },
                                    additionalProperties: false,
                                    required: ['name', 'sort']
                                }
                            },
                            additionalProperties: false
                        }
                    },
                    additionalProperties: false,
                    required: ['name', 'sort', 'children']
                }
            }
        }
    },
    additionalProperties: false,
    required: [
        //
        'appName',
        'md5Salt',
        'port',
        'host',
        'devPassword',
        'paramsCheck',
        'isSwagger',
        'tablePrimaryKey',
        'freeApis',
        'whiteApis',
        'blackApis',
        'rate',
        'mail',
        'jwt',
        'mysql',
        'redis',
        'cron',
        'cache',
        'http',
        'role',
        'menu'
    ]
};
