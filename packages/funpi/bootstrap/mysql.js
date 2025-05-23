import fp from 'fastify-plugin';
import Knex from 'knex';
import { isArray as es_isArray } from 'es-toolkit/compat';
import { fnIncrTimeID } from '../utils/index.js';

// 添加函数
const dbInsert = (obj) => {
    const newObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (obj[key] !== null && obj[key] !== undefined) {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.created_at = Date.now();
    newObj.updated_at = Date.now();
    if (process.env.TABLE_PRIMARY_KEY !== 'default') {
        // 当主键为 time 模式时，更改 id 字段的值
        if (process.env.TABLE_PRIMARY_KEY === 'time') {
            newObj.id = fnIncrTimeID();
        }
    }
    return newObj;
};

// 更新函数
const dbUpdate = (obj) => {
    const excludeFields = ['id', 'created_at'];
    const newObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (obj[key] !== null && obj[key] !== undefined && !excludeFields.includes(key)) {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.updated_at = Date.now();
    return newObj;
};

async function plugin(fastify) {
    try {
        // 添加数据
        Knex.QueryBuilder.extend('insertData', function (data) {
            if (es_isArray(data)) {
                const data2 = data.map((item) => {
                    return dbInsert(item);
                });
                return this.insert(data2);
            } else {
                return this.insert(dbInsert(data));
            }
        });
        // 更新数据
        Knex.QueryBuilder.extend('updateData', function (data) {
            return this.update(dbUpdate(data));
        });
        // 删除数据
        Knex.QueryBuilder.extend('deleteData', function (data) {
            return this.delete(data);
        });
        // 查询数据
        Knex.QueryBuilder.extend('selectData', function (page, limit, args) {
            if (es_isArray(args) === true) {
                return this.offset((page - 1) * limit)
                    .limit(limit)
                    .select(...args);
            } else {
                return this.offset((page - 1) * limit)
                    .limit(limit)
                    .select();
            }
        });
        // 查询一条
        Knex.QueryBuilder.extend('selectOne', function (args) {
            if (es_isArray(args) === true) {
                return this.first(...args);
            } else {
                return this.first();
            }
        });
        // 查询所有
        Knex.QueryBuilder.extend('selectAll', function (args) {
            if (es_isArray(args) === true) {
                return this.select(...args);
            } else {
                return this.select();
            }
        });
        // 查询总数
        Knex.QueryBuilder.extend('selectCount', function () {
            return this.count('id', { as: 'totalCount' }).first();
        });

        // 定义数据库链接
        const mysql = await new Knex({
            client: 'mysql2',
            connection: {
                host: process.env.MYSQL_HOST,
                port: Number(process.env.MYSQL_PORT),
                user: process.env.MYSQL_USERNAME,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DB
            },
            acquireConnectionTimeout: 30000,
            asyncStackTraces: true,
            debug: false,
            pool: {
                min: 10,
                max: 100
                // afterCreate: function (db, done) {
                // in this example we use pg driver's connection API
                // db.query('SET NAMES utf8mb4;', function (err) {
                //     if (err) {
                //         // first query failed,
                //         // return error and don't try to make next query
                //         done(err, db);
                //     } else {
                //         // do the second query...
                //         db.query('SELECT set_limit(0.01);', function (err) {
                //             // if err is not falsy,
                //             //  connection is discarded from pool
                //             // if connection aquire was triggered by a
                //             // query the error is passed to query promise
                //             done(err, db);
                //         });
                //     }
                // });
                // }
            }
        });

        // 测试数据库连接
        try {
            await mysql.raw('SELECT 1');
        } catch (err) {
            fastify.log.error({ msg: 'Mysql连接失败', error: err.message });
            process.exit();
        }

        fastify.decorate('mysql', mysql).addHook('onClose', (instance, done) => {
            if (instance.mysql === mysql) {
                instance.mysql.destroy();
            }

            done();
        });
    } catch (err) {
        fastify.log.error(err);
        process.exit();
    }
}

export default fp(plugin, { name: 'funpiMysql' });
