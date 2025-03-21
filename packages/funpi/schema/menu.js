export const menuSchema = {
    title: '菜单字段',
    type: 'array',
    items: {
        title: '主菜单',
        type: 'object',
        properties: {
            path: {
                title: '菜单路径',
                type: 'string',
                pattern: '^\\/[a-z][a-z0-9\\/-]*$'
            },
            name: {
                title: '菜单名称',
                type: 'string'
            },
            children: {
                title: '子菜单',
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        path: {
                            title: '子菜单路径',
                            type: 'string',
                            pattern: '^\\/[a-z][a-z0-9\\/-]*$'
                        },
                        name: {
                            title: '菜单名称',
                            type: 'string'
                        }
                    },
                    additionalProperties: false,
                    required: ['path', 'name']
                }
            }
        },
        additionalProperties: false,
        required: ['path', 'name', 'children']
    }
};
