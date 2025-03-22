<template>
    <div class="page-admin page-full">
        <div class="page-action">
            <div class="left">
                <a-space>
                    <a-select v-model="$Data.formData.category_code" style="width: 150px" @change="$Method.apiSelectData">
                        <a-option v-for="item in $Data.categoryAll" :key="item.id" :value="item.code" :label="item.name"></a-option>
                    </a-select>
                    <a-button type="primary" @click="$Method.onDataAction('insertData', {})">添加</a-button>
                </a-space>
            </div>
            <div class="right">
                <a-input v-model="$Data.formData.keyword" placeholder="请输入搜索关键字" allow-clear @clear="$Method.apiSelectData"></a-input>
                <div class="w-10px"></div>
                <a-button type="primary" @click="$Method.apiSelectData">搜索</a-button>
            </div>
        </div>
        <div class="page-table">
            <a-table :data="$Data.tableData" :scroll="$GlobalData.tableScroll" :pagination="false" :bordered="$GlobalData.tableBordered" row-key="id">
                <template #columns>
                    <a-table-column title="名称" data-index="name" :width="150"></a-table-column>
                    <a-table-column title="编码" data-index="code" :width="100"></a-table-column>
                    <a-table-column title="值" data-index="value" :width="200"></a-table-column>
                    <a-table-column title="描述" data-index="describe"></a-table-column>
                    <a-table-column title="操作" fixed="right" :width="100" align="right">
                        <template #cell="{ record }">
                            <a-dropdown position="br" @select="$Method.onDataAction($event, record)">
                                <a-button>操作<icon-down /></a-button>
                                <template #content>
                                    <a-doption value="updateData"><icon-edit />编辑</a-doption>
                                    <a-doption value="deleteData"> <icon-delete />删除</a-doption>
                                </template>
                            </a-dropdown>
                        </template>
                    </a-table-column>
                </template>
            </a-table>
        </div>
        <div class="page-page">
            <div class="left"></div>
            <div class="right">
                <a-pagination v-model:current="$Data.pagination.page" :total="$Data.pagination.total" show-total />
            </div>
        </div>

        <!-- 编辑数据抽屉 -->
        <editDataDrawer v-if="$Data.isShow.editDataDrawer" v-model="$Data.isShow.editDataDrawer" :actionType="$Data.actionType" :rowData="$Data.rowData" :categoryAll="$Data.categoryAll" :category_code="$Data.formData.category_code" @changeCategory="$Method.changeCategory" @success="$Method.fnFreshData"></editDataDrawer>
    </div>
</template>

<script setup>
// 外部集

// 内部集
import editDataDrawer from './components/editDataDrawer.vue';

// 全局集
const { $GlobalData, $GlobalComputed, $GlobalMethod } = useGlobal();

// 工具集

// 数据集
const $Data = $ref({
    // 显示和隐藏
    isShow: {
        editDataDrawer: false
    },
    actionType: 'insertData',
    categoryAll: [],
    tableData: [],
    rowData: {},
    formData: {
        category_code: '',
        keyword: ''
    },
    pagination: {
        page: 1,
        total: 0
    }
});

// 方法集
const $Method = {
    async initData() {
        await $Method.apiSelectCategory();
        if ($Data.formData.category_code) {
            await $Method.apiSelectData();
        }
    },
    // 触发数据事件
    onDataAction(actionType, rowData) {
        $Data.actionType = actionType;
        $Data.rowData = rowData;

        // 编辑数据
        if ($Data.actionType === 'insertData' || $Data.actionType === 'updateData') {
            $Data.isShow.editDataDrawer = true;
            return;
        }

        // 删除数据
        if ($Data.actionType === 'deleteData') {
            Modal.confirm({
                title: '提示',
                content: '请确认是否删除？',
                modalClass: 'delete-modal-class',
                alignCenter: true,
                onOk() {
                    $Method.apiDeleteData();
                }
            });
        }
    },
    changeCategory(category_code) {
        $Data.formData.category_code = category_code;
        $Method.apiSelectData();
    },
    // 刷新数据
    async fnFreshData() {
        $Method.apiSelectData();
    },
    // 查询字典分类
    async apiSelectCategory() {
        try {
            const res = await $Http({
                url: '/funpi/dict/categorySelectAll',
                data: {}
            });
            $Data.categoryAll = res.data.rows.map((item, index) => {
                if (index === 0) {
                    $Data.formData.category_code = item.code;
                }
                return item;
            });
        } catch (err) {
            console.log('🚀 ~ file: index.vue:86 ~ apiSelectData ~ err:', err);
            Message.error(err.msg || err);
        }
    },
    // 查询用户数据
    async apiSelectData() {
        try {
            const res = await $Http({
                url: '/funpi/dict/dictSelectPage',
                data: {
                    page: $Data.pagination.page,
                    limit: $GlobalData.pageLimit,
                    keyword: $Data.formData.keyword,
                    category_code: $Data.formData.category_code
                }
            });
            $Data.tableData = res.data.rows;
            $Data.pagination.total = res.data.total;
        } catch (err) {
            console.log('🚀 ~ file: index.vue:86 ~ apiSelectData ~ err:', err);
            Message.error(err.msg || err);
        }
    },
    // 删除数据
    async apiDeleteData() {
        try {
            const res = await $Http({
                url: '/funpi/dict/dictDelete',
                data: {
                    id: $Data.rowData.id
                }
            });
            await $Method.apiSelectData();
            Message.success({
                content: res.msg
            });
        } catch (err) {
            Message.error({
                content: err.msg || err
            });
        }
    }
};

$Method.initData();
</script>

<style lang="scss" scoped>
.page-admin {
}
</style>
