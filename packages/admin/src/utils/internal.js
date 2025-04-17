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
 * 计算剩余时间
 * @param {number} seconds 剩余时间秒数
 * @returns {object} 返回剩余时间的不同单位值
 */
export const utilLeftTime = (seconds) => {
    const absTime = Math.abs(seconds);

    // 定义时间单位常量提高可读性
    const SECONDS_PER_MINUTE = 60;
    const SECONDS_PER_HOUR = 60 * 60;
    const SECONDS_PER_DAY = 24 * 60 * 60;
    const SECONDS_PER_WEEK = 7 * SECONDS_PER_DAY;
    const SECONDS_PER_MONTH = 30 * SECONDS_PER_DAY;
    const SECONDS_PER_YEAR = 365 * SECONDS_PER_DAY;

    const parsed = {
        // 使用常量计算各时间单位
        years: Math.floor(absTime / SECONDS_PER_YEAR),
        months: Math.floor(absTime / SECONDS_PER_MONTH),
        weeks: Math.floor(absTime / SECONDS_PER_WEEK),
        days: Math.floor(absTime / SECONDS_PER_DAY),
        hours: Math.floor(absTime / SECONDS_PER_HOUR),
        minutes: Math.floor(absTime / SECONDS_PER_MINUTE),
        seconds: absTime,
        text: '',
        type: seconds > 0 ? '还剩' : '已过'
    };

    // 设置友好文本
    if (parsed.years > 0) {
        parsed.text = `${parsed.years} 年`;
    } else if (parsed.months > 0) {
        parsed.text = `${parsed.months} 月`;
    } else if (parsed.weeks > 0) {
        parsed.text = `${parsed.weeks} 周`;
    } else if (parsed.days > 0) {
        parsed.text = `${parsed.days} 天`;
    } else if (parsed.hours > 0) {
        parsed.text = `${parsed.hours} 小时`;
    } else if (parsed.minutes > 0) {
        parsed.text = `${parsed.minutes} 分钟`;
    } else if (parsed.seconds > 0) {
        parsed.text = `${parsed.seconds} 秒`;
    } else {
        parsed.text = '0 秒';
    }

    return parsed;
};
