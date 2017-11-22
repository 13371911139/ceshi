var express= require('express');
var router = express.Router();
var mysql = require('mysql');
var SQL={
    Connect: (fun)=>{
        var connection = mysql.createConnection({
            host: '127.0.0.1',
            port : 3306,
            user: 'admin',
            password: 'yunxian123!',
            database:'lexiu_yunxian'
        });

        connection.connect();
        fun && fun(connection)
    },
    query:(dat)=>{//查询
        dat.connection.query(dat.sql, (err, rows, fields)=> {
            if (err) throw err;
            console.log(rows);
            if(dat.fun){
                dat.fun(rows[0] ? rows[0].ID : rows)
            }else if(dat.success){
                dat.success(rows)
            }else{
                dat.connection.end();
            }
        });
    }
}
module.exports = SQL;