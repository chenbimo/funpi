import { yd_crypto_md5, yd_object_omit, yd_is_empty } from 'yidash';
//  检查传参有效性
export function fnApiCheck(req) {
    return new Promise((resolve, reject) => {
        const fields = req.body;

        const fieldsParams = yd_object_omit(fields, ['sign']);

        if (yd_is_empty(fieldsParams)) {
            return resolve({ code: 0, msg: '接口未带参数' });
        }

        if (!fieldsParams.t) {
            return reject({ code: 1, msg: '接口请求时间无效' });
        }

        const diffTime = Date.now() - Number(fieldsParams.t);
        if (diffTime > 3 * 60 * 1000) {
            return reject({ code: 1, msg: '接口请求时间已过期' });
        }

        const fieldsArray = [];
        for (let key in fieldsParams) {
            if (Object.prototype.hasOwnProperty.call(fieldsParams, key)) {
                const value = fieldsParams[key];
                if (value !== undefined && value !== null) {
                    fieldsArray.push(`${key}=${value}`);
                }
            }
        }

        const fieldsSort = fieldsArray.sort().join('&');

        const fieldsMd5 = yd_crypto_md5(fieldsSort);

        if (fieldsMd5 !== fields.sign) {
            return reject({ code: 1, msg: '接口请求参数校验失败', detail: { sign: fieldsMd5, sort: fieldsSort } });
        }

        return resolve({ code: 0, msg: '接口参数正常' });
    });
}
