export const menuConfig = [
    {
        path: '/banner',
        name: '轮播管理',
        children: [
            {
                path: '/banner/lists',
                name: '轮播列表'
            }
        ]
    },
    {
        path: '/machine',
        name: '机器管理',
        children: [
            {
                path: '/machine/category',
                name: '分类管理'
            },
            {
                path: '/machine/lists',
                name: '机器列表'
            },
            {
                path: '/machine/rare',
                name: '机器罕度'
            },
            {
                path: '/machine/product',
                name: '机器产品'
            }
        ]
    },
    {
        path: '/chou',
        name: '抽奖管理',
        children: [
            {
                path: '/chou/lists',
                name: '抽奖配置'
            },
            {
                path: '/chou/result',
                name: '抽奖结果'
            }
        ]
    },
    {
        path: '/order',
        name: '订单管理',
        children: [
            {
                path: '/order/pay',
                name: '支付订单'
            },
            {
                path: '/order/send',
                name: '寄送订单'
            }
        ]
    },
    {
        path: '/user',
        name: '用户管理',
        children: [
            {
                path: '/user/level',
                name: '等级管理'
            },
            {
                path: '/user/lists',
                name: '用户列表'
            },
            {
                path: '/address/lists',
                name: '地址列表'
            }
        ]
    },
    {
        path: '/setup',
        name: '设置中心',
        children: [
            {
                path: '/setup/protocol',
                name: '协议管理'
            }
        ]
    }
];
