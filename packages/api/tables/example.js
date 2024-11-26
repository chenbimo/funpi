export const tableName = '新闻示例表';
export const tableData = {
    title: {
        name: '新闻标题',
        type: 'string',
        default: '',
        min: 1,
        max: 50
    },
    content: {
        name: '新闻内容',
        type: 'string',
        min: 0
    }
};
