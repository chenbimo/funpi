<template>
    <a-layout class="layout-default">
        <a-layout-sider class="layout-sider" :collapsed="$Data.collapsed" :width="240" collapsible hide-trigger>
            <div class="info-area" @click="$Router.push('/')">
                <div class="logo bg-contain" :style="{ backgroundImage: 'url(' + utilInternalAssets('logo.png') + ')' }"></div>
                <div class="name">{{ $AppConfig.appName }}</div>
            </div>
            <div class="menu-area">
                <sideMenu v-if="$Data.isShow.sideMenu === true" :openMenuId="$Data.openMenuId" :selectedItemId="$Data.selectedItemId" :menuObject="$Data.menuObject" :menuTree="$Data.menuTree"></sideMenu>
            </div>
        </a-layout-sider>
        <a-layout class="layout-main" style="height: 100%">
            <div class="layout-header">
                <div class="left">
                    <!-- <a-button @click="$Method.onCollapse">
                        <template #icon>
                            <icon-menu-fold v-if="$Data.collapsed" />
                            <icon-menu-unfold v-else />
                        </template>
                    </a-button> -->
                </div>
                <div class="right">
                    <a-dropdown position="br" @select="$Method.onUserAction">
                        <a-button type="text">
                            {{ $GlobalData.userData.nickname }}
                            <!--  -->
                            <icon-caret-down size="16px" style="margin-top: 2px; margin-left: 4px" />
                        </a-button>
                        <!-- <a-avatar class="ml-10px" :size="36" :imageUrl="$GlobalData.userData.avatar"> </a-avatar> -->
                        <template #content>
                            <!-- <a-doption value="个人资料">
                                <template #icon><i-bi-person class="text-12px" /></template>
                                个人资料
                            </a-doption> -->
                            <a-doption value="退出登录" @click="$Method.onLogout">
                                <template #icon><i-bi-x-circle class="text-12px" /></template>
                                退出登录
                            </a-doption>
                        </template>
                    </a-dropdown>
                </div>
            </div>
            <div class="layout-content">
                <router-view></router-view>
            </div>
        </a-layout>
    </a-layout>
</template>

<script setup>
// 外部集
import { keyBy as _keyBy, cloneDeep as _cloneDeep, sortBy as _sortBy } from 'es-toolkit';

// 内部集
import sideMenu from './components/sideMenu.vue';

// 全局集
const { $GlobalData, $GlobalComputed, $GlobalMethod } = useGlobal();
const $Route = useRoute();

// 数据集
const $Data = $ref({
    isShow: {
        sideMenu: false
    },
    collapsed: false,
    menuTree: [],
    menuObject: {},
    openMenuId: 0,
    selectedItemId: 0,
    selectedItem: {}
});

// 方法集
const $Method = {
    async initData() {
        await $Method.apiTokenCheck();
        await $Method.apiGetAdminMenus();
    },
    async onCollapse() {
        $Data.collapsed = !$Data.collapsed;
    },
    onLogout() {
        $Storage.clearAll();
        $GlobalData.token = '';
        $GlobalData.userData = {};
        $Router.push('/internal/login');
    },
    // 点击菜单项
    onMenuItemClick(id) {
        $Data.selectedItemId = id;
        $Data.selectedItem = $Data.menuObject[id];
        $Router.push($Data.selectedItem.value);
    },
    // 令牌检测
    async apiTokenCheck() {
        try {
            const res = await $Http({
                url: '/funpi/tool/tokenCheck',
                data: {}
            });
            if (res.data.state === 'no') {
                $Router.push('/internal/login');
            }
            console.log('🚀 ~ file: index.vue:105 ~ apiTokenCheck ~ res:', res);
        } catch (err) {
            console.log('🚀 ~ file: index.vue:102 ~ apiTokenCheck ~ err:', err);
        }
    },
    // 获取管理员菜单
    async apiGetAdminMenus() {
        try {
            const res = await $Http({
                url: '/funpi/admin/getMenus',
                data: {}
            });
            console.log('🔥[ res ]-120', res);

            $Data.menuObject = _keyBy(_cloneDeep(res.data.rows), (item) => item.id);
            $Data.menuTree = utilArrayToTree(_sortBy(res.data.rows, ['sort']));
            $Data.menuTree.forEach((menu, index) => {
                menu.children?.forEach((item, index2) => {
                    if (item.value === $Route.path) {
                        $Data.openMenuId = item.pid;
                        $Data.selectedItemId = item.id;
                        $Data.selectedItem = $Data.menuObject[item.id];
                    }
                });
            });
            $Data.isShow.sideMenu = true;
            if ($Data.selectedItem.value) {
                $Router.push($Data.selectedItem?.value);
            }
        } catch (err) {
            console.log('🚀 ~ file: default.vue ~ line 129 ~ apiGetMenus ~ err', err);
        }
    }
};

$Method.initData();
</script>

<style lang="scss" scoped>
.layout-default {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    .layout-sider {
        height: 100vh;
        display: flex;
        flex-direction: column;
        z-index: 9;
        .info-area {
            flex: 0 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 10px;
            background-color: #eef5f8;
            cursor: pointer;
            .logo {
                width: 60px;
                height: 60px;
            }
            .name {
                font-size: 16px;
                margin-top: 10px;
            }
        }
        .menu-area {
            flex: 1 1 100%;
            overflow-y: auto;
        }
    }
    .layout-main {
        position: relative;
    }
    .layout-header {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        padding: 0 10px;
        background-color: #eee;
        .left {
            display: flex;
            align-items: center;
        }
        .right {
            display: flex;
            align-items: center;
        }
    }
    .layout-content {
        position: absolute;
        top: 60px;
        left: 0;
        right: 0;
        bottom: 0;
    }
}
</style>
