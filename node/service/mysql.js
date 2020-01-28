const mysql = require('mysql')
    ;
const { MYSQL_ADDRESS, MYSQL_DATABASE, MYSQL_ACCOUNT, MYSQL_PASSWORD } = require('../config');
const pool = mysql.createPool({
    host: MYSQL_ADDRESS,
    database: MYSQL_DATABASE,
    user: MYSQL_ACCOUNT,
    password: MYSQL_PASSWORD
});


function rangeSql(range) {
    const keys = Object.keys(range);
    let sql = `where `;
    keys.map(k => {
        sql += `${k} = '${range[k]}' and`;
    });
    sql = sql.slice(0, -4);
    return sql;
}

function sqlCommand(sql, r, j) {
    pool.getConnection((err, connect) => {
        connect.connect();
        connect.query(sql, (err, result) => {
            if (err) return j(err.message);
            return r(result);
        });
        connect.release();
    });
}

module.exports = {
    originSql: (sql) => new Promise((r, j) => {
        sqlCommand(sql, r, j);
    }),

    selectAll: (table) => new Promise((r, j) => {
        sqlCommand(`select * from ${table}`, r, j);
    }),

    select: (table, range) => new Promise((r, j) => {
        let sql = `select * from ${table} ${rangeSql(range)}`;
        sqlCommand(sql, r, j);
    }),

    insert: (table, data) => new Promise((r, j) => {
        let key = '';
        let val = [];
        Object.entries(data).map(([k, v]) => {
            key += k + ',';
            val.push(`'${v}'`);
        });
        key = key.slice(0, -1);
        let sql = `insert into ${table}(${key}) values(${val.toString()})`
        sqlCommand(sql, r, j);
    }),

    update: (table, range, data) => new Promise((r, j) => {
        let key = '';
        let val = [];
        Object.entries(data).map(([k, v]) => {
            key += `${k} = ?,`
            val.push(v);
        });
        key = key.slice(0, -1);
        let sql = `update ${table} set ${key} ${rangeSql(range)}`;
        pool.getConnection((err, connect) => {
            connect.connect();
            connect.query(sql, val, (err, result) => {
                if (err) return j(err.message);
                return r(result);
            });
            connect.release();
        });
    }),
}
