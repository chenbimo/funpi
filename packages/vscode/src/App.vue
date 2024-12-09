<template>
    <div class="app">
        <a-config-provider size="small">
            <div class="page-wrapper">
                <OverlayScrollbarsComponent :options="{ scrollbars: { theme: 'os-theme-light', autoHide: 'scroll' } }">
                    <div class="data-inner">
                        <div class="box">
                            <div class=""></div>
                        </div>
                    </div>
                </OverlayScrollbarsComponent>
            </div>
        </a-config-provider>
    </div>
</template>
<script setup>
// 样式导入
import 'overlayscrollbars/overlayscrollbars.css';
// 外部导入
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue';

// 内部导入
import { umamiSpa } from '@/umamiSpa.js';

// 全局集
const { $GlobalData } = useGlobal();

// 数据集
const $Data = $ref({});

// 计算集
const $Computed = $ref({
    // 排序
    sortName: computed(() => {})
});

// 方法集
const $Method = {
    // 初始数据
    async initData() {
        utilPostMessage('umamiTongJi', {});
        window.addEventListener('message', async (event) => {
            const { method, data } = event.data;

            // 激活扩展
            if (method === 'activeExtend') {
            }

            // 发送扩展统计
            if (method === 'umamiTongJi') {
                umamiSpa({
                    macid: data.machineCode,
                    website: 'cbc670b7-b6cf-41c6-b8a1-c743cc26a383'
                });
            }
        });
    }
};

onMounted(() => {
    $Method.initData();
});
</script>

<style lang="scss">
@use '@/styles/global.scss';
.app {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    font-family: 'Segoe WPC', 'Segoe UI', sans-serif !important;
    font-size: 14px;
}

.page-wrapper {
    min-height: 100vh;
}
</style>
