import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 获取资源
export function utilInternalAssets(name) {
    return new URL(`../assets/${name}`, import.meta.url).href;
}

// 树结构遍历
export const utilTreeTraverse = (tree, mapFunction) => {
    function preorder(node, index, parent) {
        const newNode = Object.assign({}, mapFunction(node, index, parent));

        if ('children' in node) {
            newNode.children = node.children.map(function (child, index) {
                return preorder(child, index, node);
            });
        }

        return newNode;
    }

    return preorder(tree, null, null);
};

export const utilArrayToTree = (arrs, id = 'id', pid = 'pid', children = 'children', forceChildren = true) => {
    // 输入验证
    if (!Array.isArray(arrs) || arrs.length === 0) {
        return [];
    }

    // 使用 Map 存储项目，并创建副本避免修改原始数据
    const idMap = new Map();
    arrs.forEach((item) => {
        // 创建每个项目的副本
        idMap.set(item[id], { ...item });
    });

    const treeData = [];

    // 构建树结构
    idMap.forEach((item) => {
        const parentId = item[pid];
        const parent = idMap.get(parentId);

        if (parent) {
            // 添加到父项的子列表
            if (!parent[children]) {
                parent[children] = [];
            }
            parent[children].push(item);
        } else {
            // 根节点
            if (forceChildren && !item[children]) {
                item[children] = [];
            }
            treeData.push(item);
        }
    });

    return treeData;
};

/**
 * 转换相对时间
 * @alias yd_datetime_relativeTime
 * @category datetime
 * @param {Array | object} data 数组或对象
 * @returns {object} 返回转换后的相对时间
 * @author 陈随易 <https://chensuiyi.me>
 * @example yd_datetime_relativeTime([])
 */
export const utilRelativeTime = (data) => {
    // 转换相对时间
    const _convertTime = (obj) => {
        try {
            const item = {};
            for (let key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const value = obj[key];
                    if (key.endsWith('_at')) {
                        let key1 = key.replace('_at', '_at1');
                        let key2 = key.replace('_at', '_at2');
                        let dt = new Date(value);
                        if (value !== 0) {
                            item[key] = value;
                            item[key1] = format(dt, 'yyyy-MM-dd HH:mm:ss');
                            item[key2] = formatDistanceToNow(dt, { locale: zhCN, addSuffix: true });
                        } else {
                            item[key] = '';
                        }
                    } else {
                        item[key] = value;
                    }
                }
            }

            return item;
        } catch (err) {
            console.log('🚀 ~ err:', err);
        }
    };
    // 如果是数组
    if (Array.isArray(data)) {
        return data.map((item) => {
            return _convertTime(item);
        });
    }

    // 如果是对象
    return _convertTime(data);
};
