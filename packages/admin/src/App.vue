<template>
    <div class="app">
        <a-config-provider size="small">
            <router-view></router-view>
        </a-config-provider>
    </div>
</template>
<script setup>
// 方法集
const $Method = {
    // 初始化数据
    async initData() {}
    // fnMap(备注)等一会写一个接口函数
    // outlinePlus(Todo)The number is too small
};

$Method.initData();
</script>

<style lang="scss">
@import '@/styles/global.scss';
</style>
