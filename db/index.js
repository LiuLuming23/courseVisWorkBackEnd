const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "2343865QQ",
  port: "3306",
  database: "t_vis",
});

connection.connect((err) => {
  if (err) {
    console.error("数据库连接失败: " + err.stack);
    return;
  }
  console.log("数据库连接成功");
});
const sql = {
  query: (sqlStr,value) => {
    // console.log(sqlStr);
    return new Promise((resolve, reject) => {
      connection.query(sqlStr,value, (err, res) => {
          if(err){
            reject(err);
          }
          resolve(res)
      });
    });
  },
};
module.exports = sql;
