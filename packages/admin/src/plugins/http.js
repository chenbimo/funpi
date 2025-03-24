import axios from 'axios';
import { Message } from '@arco-design/web-vue';

const $Http = axios.create({
    method: 'POST',
    baseURL: import.meta.env.VITE_HOST,
    timeout: 1000 * 60,
    withCredentials: false,
    responseType: 'json',
    responseEncoding: 'utf8',
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    },
    transformRequest: [
        (data, headers) => {
            const data2 = {};
            for (let key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key) && [null, undefined].includes(data[key]) === false) {
                    data2[key] = data[key];
                }
            }
            return JSON.stringify(data2);
        }
    ]
});
// 添加请求拦截器
$Http.interceptors.request.use(
    function (config) {
        const token = $Storage.local.get('token');
        if (token) {
            config.headers.authorization = 'Bearer ' + token;
        }
        return config;
    },
    function (err) {
        return Promise.reject(err);
    }
);

// 添加响应拦截器
$Http.interceptors.response.use(
    function (res) {
        if (res.data.code === 0) {
            return Promise.resolve(res.data);
        }
        if (res.data.symbol === 'NOT_LOGIN') {
            location.href = location.origin + '/#/internal/login';
        }
        return Promise.reject(res.data);
    },
    function (err) {
        Message.error(err.message);
        return Promise.reject(err);
    }
);
export { $Http };
