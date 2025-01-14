<template>
    <a-modal v-model:visible="$Data.visible" :width="$GlobalData.modalShortWidth" body-class="my-modal-class" :esc-to-close="false" :mask-closable="false" :closable="false" unmountOnClose>
        <template #title>
            <template v-if="$Prop.actionType === 'insertData'">添加角色</template>
            <template v-if="$Prop.actionType === 'updateData'">编辑角色</template>
        </template>
        <div class="bodyer">
            <div class="top">
                <a-form :model="$Data.formData" layout="horizontal" label-align="left" auto-label-width>
                    <a-form-item field="code" label="角色编码">
                        <a-input v-model="$Data.formData.code" placeholder="请输入角色编码" />
                    </a-form-item>
                    <a-form-item field="name" label="角色名称">
                        <a-input v-model="$Data.formData.name" placeholder="请输入角色名称" />
                    </a-form-item>
                    <a-form-item field="describe" label="角色描述">
                        <a-input v-model="$Data.formData.describe" placeholder="请输入角色描述" />
                    </a-form-item>
                </a-form>
            </div>
            <div class="bottom">
                <div class="left">
                    <div class="panel-name">
                        <a-tag color="red" size="medium" :default-checked="true">菜单权限</a-tag>
                    </div>
                    <a-tree v-model:checked-keys="$Data.menuCheckedKeys" v-model:half-checked-keys="$Data.menuHalfCheckedKeys" :checkable="true" :data="$Data.allMenuTreeData" :field-names="$Data.fieldNames" action-on-node-click="expand" show-line block-node />
                </div>
                <div class="right">
                    <div class="panel-name">
                        <a-tag color="red" size="medium" :default-checked="true">接口权限</a-tag>
                    </div>
                    <a-tree v-model:checked-keys="$Data.apiCheckedKeys" v-model:half-checked-keys="$Data.apiHalfCheckedKeys" :checkable="true" :data="$Data.allApiTreeData" :field-names="$Data.fieldNames" action-on-node-click="expand" show-line block-node />
                </div>
            </div>
        </div>
        <template #footer>
            <div class="footer flex justify-center">
                <a-space size="large">
                    <a-button @click="$Method.onClose">取消</a-button>
                    <a-button type="primary" @click="$Method.apiRoleBindPermission">确定</a-button>
                </a-space>
            </div>
        </template>
    </a-modal>
</template>
<script setup>
// 外部集
import { yd_tree_array2Tree } from 'yidash';
import { cloneDeep as _cloneDeep, keyBy as _keyBy } from 'es-toolkit';
import { concat as _concat } from 'es-toolkit/compat';

// 内部集

// 全局集
const { $GlobalData, $GlobalComputed, $GlobalMethod } = useGlobal();

// 属性集
const $Prop = defineProps({
    modelValue: {
        type: Boolean
    },
    actionType: {
        type: String,
        default: 'insertData'
    },
    rowData: {
        type: Object,
        default: {}
    }
});

// 事件集
const $Emit = defineEmits(['update:modelValue', 'success']);

// 数据集
const $Data = $ref({
    visible: false,
    // 表单数据
    formData: {
        name: '',
        code: '',
        describe: ''
    },
    fieldNames: {
        key: 'id',
        title: 'name'
    },
    // 菜单数据
    allMenuTableData: [],
    allMenuTreeData: [],
    allMenuDataObject: {},
    // 接口数据
    allApiTableData: [],
    allApiTreeData: [],
    allApiDataObject: {},
    // 选中的菜单复选框
    menuCheckedKeys: [],
    // 半选的菜单复选框
    menuHalfCheckedKeys: [],
    // 选中的接口复选框
    apiCheckedKeys: [],
    // 半选的接口复选框
    apiHalfCheckedKeys: []
});

// 方法集
const $Method = {
    async initData() {
        $Data.visible = $Prop.modelValue;
        $Data.formData = Object.assign($Data.formData, $Prop.rowData, {
            api_ids: $Prop.rowData?.api_ids?.split(',')?.map((id) => Number(id)) || [],
            menu_ids: $Prop.rowData?.menu_ids?.split(',')?.map((id) => Number(id)) || []
        });
        await $Method.apiSelectAllMenuData();
        await $Method.apiSelectAllApiData();
        $Data.apiCheckedKeys = $Data.formData.api_ids.filter((id) => {
            return $Data.allApiDataObject[id]?.is_bool === 1;
        });
        $Data.menuCheckedKeys = $Data.formData.menu_ids.filter((id) => {
            return $Data.allMenuDataObject[id]?.pid !== 0;
        });
    },
    // 关闭抽屉事件
    onClose() {
        $Data.visible = false;
        setTimeout(() => {
            $Emit('update:modelValue', false);
        }, 300);
    },
    // 查询所有菜单数据
    async apiSelectAllMenuData() {
        try {
            const res = await $Http({
                url: '/admin/menuSelectAll',
                data: {}
            });
            const data = res.data.rows.map((item) => {
                if ($Data.formData.menu_ids.includes(item.id)) {
                    item.checked = true;
                } else {
                    item.checked = false;
                }
                return item;
            });
            $Data.allMenuTableData = data;
            $Data.allMenuTreeData = yd_tree_array2Tree(_cloneDeep(data));
            $Data.allMenuDataObject = _keyBy(data, (item) => item.id);
        } catch (err) {
            Message.error(err.msg || err);
        }
    },
    // 查询所有接口数据
    async apiSelectAllApiData() {
        try {
            const res = await $Http({
                url: '/admin/apiSelectAll',
                data: {}
            });
            const data = res.data.rows.map((item) => {
                if ($Data.formData.api_ids.includes(item.id)) {
                    item.checked = true;
                } else {
                    item.checked = false;
                }
                return item;
            });
            $Data.allApiTableData = data;
            $Data.allApiTreeData = yd_tree_array2Tree(_cloneDeep(data));
            $Data.allApiDataObject = _keyBy(data, (item) => item.id);
        } catch (err) {
            Message.error(err.msg || err);
        }
    },
    // 绑定角色权限
    async apiRoleBindPermission() {
        try {
            const url = {
                insertData: '/admin/roleInsert',
                updateData: '/admin/roleUpdate'
            }[$Prop.actionType];

            const menuIds = _concat($Data.menuCheckedKeys, $Data.menuHalfCheckedKeys);
            const apiIds = _concat($Data.apiCheckedKeys, $Data.apiHalfCheckedKeys);

            const res = await $Http({
                url: url,
                data: {
                    ...$Data.formData,
                    menu_ids: menuIds.join(','),
                    api_ids: apiIds.join(',')
                }
            });
            Message.success({
                content: res.msg
            });
            $Method.onClose();
            $Emit('success');
        } catch (err) {
            Message.warning({
                content: err.msg || err
            });
        }
    }
};

$Method.initData();
</script>

<style lang="scss" scoped>
.bodyer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .top {
        flex: 0 0 auto;
        padding-bottom: 5px;
        margin-bottom: 10px;
    }
    .bottom {
        display: flex;
        flex: 1 1 100%;
        .left {
            flex: 0 0 40%;
            border-right: 1px solid #ddd;
            padding-right: 15px;
            overflow-y: auto;
        }
        .right {
            flex: 0 0 60%;
            padding-left: 15px;
            overflow-y: auto;
        }
    }

    .panel-name {
        margin-bottom: 10px;
    }
}
</style>
