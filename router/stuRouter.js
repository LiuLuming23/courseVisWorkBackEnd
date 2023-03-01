const express = require("express");
const sql =require("../db/index.js");
const responseText = require("../utils/dto.js");
const stuRouter = express.Router();
/*获取班级列表*/
stuRouter.get("/getClass/:cla_grade",async(_,response)=>{
    const cla_grade=_.params['cla_grade'];
    const queryRes=await sql.query('SELECT cla_name FROM student WHERE cla_grade=? GROUP BY cla_name',[cla_grade]);
    let res=[];
    queryRes.forEach(element => {
        res.push(element['cla_name']);
    });
    response.send(responseText(res));
})
/*获取学生个人信息*/
stuRouter.get("/getStuInfo/:cla_grade/:cla_name",async(_,response)=>{
    const {cla_grade,cla_name}=_.params;
    const queryRes=await sql.query('SELECT * FROM `student` WHERE cla_grade=? AND cla_name=?',[cla_grade,cla_name]);
    response.send(responseText(queryRes));
})


module.exports=stuRouter;