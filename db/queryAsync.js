const db = require('../db')

// 定义异步执行 query 的函数
function queryAsync(sql, values) {
    return new Promise((resolve, reject) => {
        // 从连接池中获取一个连接
        db.getConnection((err, connection) => {
        if (err) {
            reject(err);
        } else {
            // 执行查询
            connection.query(sql, values, (err, rows) => {
                // 释放连接
                connection.release();
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        }
        });
    });
}

module.exports = {
    queryAsync
}