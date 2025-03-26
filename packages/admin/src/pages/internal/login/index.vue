<template>
    <div class="page-login" :style="{ backgroundImage: 'url(' + utilInternalAssets('login-back.png') + ')' }">
        <!-- 用于防止浏览器自动填充密码 -->
        <input type="password" clearable hidden autocomplete="new-password" style="display: none" />
        <div class="form-area">
            <div class="login-panel">
                <div class="left-media">
                    <img class="img" :src="utilInternalAssets('login-left-image.png')" />
                </div>
                <div class="right-content">
                    <div class="right-content-wrapper">
                        <div class="site-logo">
                            <img class="img" :src="utilInternalAssets('logo.png')" />
                        </div>
                        <div class="site-title">{{ $AppConfig.appName }}</div>
                        <div class="form-panel">
                            <a-space direction="vertical">
                                <a-input v-model="$Data.formData.account" placeholder="请输入账号">
                                    <template #prefix>
                                        <icon-user />
                                    </template>
                                </a-input>
                                <a-input v-model="$Data.formData.password" type="password" placeholder="请输入密码">
                                    <template #prefix>
                                        <icon-lock />
                                    </template>
                                </a-input>
                            </a-space>
                        </div>
                        <div class="submit-line">
                            <div class="left">
                                <a-button type="parmary" link>忘记密码</a-button>
                            </div>
                            <div class="right">
                                <a-button type="primary" size="small" :loading="$Data.isShow.logining === true" :disabled="$Data.isShow.logining === true" @click="$Method.apiAdminLogin">登录</a-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// 外部集
import { md5 } from 'js-md5';

// 外部集

// 全局集
const { $GlobalData, $GlobalComputed, $GlobalMethod } = useGlobal();

// 实例集
const $Route = useRoute();

// 数据集
const $Data = $ref({
    isShow: {
        logining: false
    },
    reqParams: {
        keywords: ''
    },
    formData: {
        account: '',
        password: ''
    },
    formRules: {
        account: { type: 'string', required: true, min: 1, max: 30, message: '请输入账号' },
        password: { type: 'string', required: true, min: 6, max: 16, message: '请输入密码' }
    }
});

// 方法集
const $Method = {
    // 初始化数据
    async initData() {},
    // 管理员登录
    async apiAdminLogin() {
        try {
            $Data.isShow.logining = true;
            const res = await $Http({
                url: '/funpi/admin/adminLogin',
                data: {
                    account: $Data.formData.account,
                    password: md5($Data.formData.password)
                }
            });

            $Storage.local.set('token', res.token);
            $Storage.local.set('userData', res.data);

            $GlobalData.token = res.token;
            $GlobalData.userData = res.data;
            Message.success({
                content: res.msg
            });
            setTimeout(() => {
                $Router.push('/');
            }, 1500);
        } catch (err) {
            console.log('🚀 ~ file: index.vue:100 ~ apiAdminLogin ~ err:', err);
            Message.error({
                content: err.msg || err
            });
        } finally {
            $Data.isShow.logining = false;
        }
    }
};

$Method.initData();
</script>

<style lang="scss" scoped>
.page-login {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;

    .form-area {
        width: 100%;
        max-width: 800px;

        .login-panel {
            width: 100%;
            display: flex;
            border: 1px solid #eee;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0px 0px 30px #ddd;
        }
        .login-tips {
            font-size: 12px;
            padding: 10px;
            text-align: center;
            color: #999;
            .link {
                padding: 0 6px;
                color: #165dff;
            }
        }
        .left-media,
        .right-content {
            height: 50vh;
            max-height: 500px;
            width: 50%;
            flex: 0 0 50%;
        }
        .left-media {
            background-color: #eee;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px 30px;
            .img {
                max-width: 100%;
                max-height: 100%;
            }
        }
        .right-content {
            background-color: #fff;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            .site-logo {
                display: flex;
                justify-content: center;
                .img {
                    width: 64px;
                }
            }
            .site-title {
                font-size: 22px;
                font-weight: bold;
                display: flex;
                justify-content: center;
                margin: 20px 10px;
            }
            .submit-line {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 20px;
            }
        }
    }
}
</style>
