const express = require("express");
const sql =require("../db/index.js");
const responseText = require("../utils/dto.js");
const dayjs =require('dayjs');
const dataRouter = express.Router();

dataRouter.post("/getHotChart",async(_,response)=>{
    const {class_term,stuIdArr}=_.body;
    if(!stuIdArr||stuIdArr.length==0){
        response.send(responseText({},403,'paramsError'));
        return;
    }
    let result=[];
    for(let i=0;i<stuIdArr.length;i++){
        const sliceTermArr=class_term.split('-');
        const firTermRes=await sql.query(`SELECT stu_id,stu_name,kq_dateTime FROM kaoqin WHERE stu_id='${stuIdArr[i]}' AND kq_controllerID!=3 AND kq_term='${sliceTermArr[0]+'-'+sliceTermArr[1]+'-1'}'`);
        const secTermRes=await sql.query(`SELECT stu_id,stu_name,kq_dateTime FROM kaoqin WHERE stu_id='${stuIdArr[i]}' AND kq_controllerID!=3 AND kq_term='${sliceTermArr[0]+'-'+sliceTermArr[1]+'-2'}'`); 
        let stuRes={},countArr=new Array(12).fill(0);
        stuRes['stu_id']=stuIdArr[i];
        if(firTermRes[0]==null){
            const stu_name=await sql.query(`SELECT stu_name from student WHERE stu_id='${stuIdArr[i]}'`);
            stuRes['stu_name']=stu_name[0]?stu_name[0]['stu_name']?stu_name[0]['stu_name']:'':'';
        }else{
            stuRes['stu_name']=firTermRes[0]['stu_name'];
        }
        for(let j=0;j<firTermRes.length;j++){
            const month=dayjs(firTermRes[j]['kq_dateTime']).get('M');
            countArr[month]++;
        }
        for(let j=0;j<secTermRes.length;j++){
            const month=dayjs(secTermRes[j]['kq_dateTime']).get('M');
            countArr[month]++;
        }
        let posArr=new Array(12);
        for(let j=0;j<12;j++){
            let count=countArr[j];
            // if(count==0&&(j>=9||j<=1||j>=2&&j<=6)){
            //     count=Math.floor(Math.random()*2);
            // }
            posArr[j]=[j,i,count];
        }
        stuRes['posArr']=posArr;
        result.push(stuRes);
    }
    response.send(responseText(result))
})

dataRouter.post("/getStackedLineChart",async(_,response)=>{
    const {class_term,stuIdArr}=_.body;
    if(!stuIdArr||stuIdArr.length==0){
        return response.send(responseText({},403,'参数错误'));
    }
    const prefix=class_term.split('-');
    const resData=[];
    //获取考试的名称列表
    const exam_name_obj={};
    for(let i=0;i<stuIdArr.length;i++){
        const res=await sql.query(`SELECT exam_name FROM chengji WHERE stu_id="${stuIdArr[i]}" GROUP BY exam_name`);
        for(let j=0;j<res.length;j++){
            if(exam_name_obj[res[j]['exam_name']]==undefined){
                exam_name_obj[res[j]['exam_name']]=0;
            }
        }
    }
    //获取学生信息
    for(let i=0;i<stuIdArr.length;i++){
        const stu_name=await sql.query(`SELECT stu_name from student WHERE stu_id='${stuIdArr[i]}'`);
        const resTmp={stu_id:stuIdArr[i],"stu_name":stu_name[0]['stu_name']||''};
        const exam_score_obj=Object.assign({},exam_name_obj);
        const courseScore=await sql.query(`SELECT exam_name,mes_Score FROM chengji WHERE stu_id="${stuIdArr[i]}"`);
        for(let j=0;j<courseScore.length;j++){
            exam_score_obj[courseScore[j]['exam_name']]+=courseScore[j]['mes_Score']<0?0:courseScore[j]['mes_Score'];
        }
        const exam_name=[];
        const mes_Score=[];
        Object.keys(exam_score_obj).forEach((it)=>{
            exam_name.push(it);
            mes_Score.push(exam_score_obj[it]);
        })
        resTmp['exam_name']=exam_name;
        resTmp['mes_Score']=mes_Score;
        resData.push(resTmp);
    }
    response.send(responseText(resData));
    /*
    {
        stu_name:'',
        stu_id:'',
        exam_name:[],
        mes_Score:[]
    }
    */
})

dataRouter.post("/getRadarChart",async (_,response)=>{
    const {class_term,stuIdArr}=_.body;
    const resData=[];
    if(!stuIdArr||stuIdArr.length==0){
        return response.send(responseText({},403,'参数错误'));
    }
    for(let i=0;i<stuIdArr.length;i++){
        const stu_name=await sql.query(`SELECT stu_name from student WHERE stu_id='${stuIdArr[i]}'`);
        const scoreAvg=await sql.query(`SELECT AVG(mes_Score) scoreAvg FROM chengji WHERE stu_id="${stuIdArr[i]}"`);
        const kqAvg=await sql.query(`SELECT COUNT(*) kqAvg FROM kaoqin WHERE stu_id="${stuIdArr[i]}"`);
        resData.push({stu_name:stu_name[0]['stu_name'],scoreAvg:scoreAvg[0]['scoreAvg'],kqAvg:kqAvg[0]['kqAvg'],consumeAvg:0});
    }
    response.send(responseText(resData));
})

dataRouter.post("/getBarChart",async (_,response)=>{
    const {class_term,stuIdArr}=_.body;
    if(!stuIdArr||stuIdArr.length==0){
        return response.send(responseText({},403,'参数错误'));
    }
    let exam_set,stu_obj_Arr=[];
    for(let i=0;i<stuIdArr.length;i++){
        const exam_set_tmp=new Set();
        const stu_obj={stu_id:stuIdArr[i],score_map:{}};
        const stu_name=await sql.query(`SELECT stu_name from student WHERE stu_id='${stuIdArr[i]}'`);
        stu_obj['stu_name']=stu_name[0]['stu_name']||'';
        const res=await sql.query(`SELECT exam_name,exam_sub_name,mes_Score FROM chengji WHERE stu_id='${stuIdArr[i]}'`);
        for(let j=0;j<res.length;j++){
            exam_set_tmp.add(res[j]['exam_name']+'-'+res[j]['exam_sub_name']);
            stu_obj['score_map'][res[j]['exam_name']+'-'+res[j]['exam_sub_name']]=res[j]['mes_Score'];
        }
        if(i==0){
            exam_set=new Set([...exam_set_tmp]);
        }else{
            // exam_set=new Set([...exam_set_tmp].filter((it)=>{return exam_set.has(it)}));
            exam_set=new Set([...exam_set,...exam_set_tmp]);
        }
        stu_obj_Arr.push(stu_obj)
    }
    const exam_arr=Array.from(exam_set);
    stu_obj_Arr.forEach((it)=>{
        const score_map={};
        exam_arr.forEach((exam_name)=>{
            score_map[exam_name]=it['score_map'][exam_name]?it['score_map'][exam_name]:0;
        })
        it['score_map']=score_map;
    })
    response.send(responseText(stu_obj_Arr));
})

dataRouter.post("/getScatter",async (_,response)=>{
    const {class_term,stuIdArr}=_.body;
    const stuRes=[];
    if(!stuIdArr||stuIdArr.length==0){
        return response.send(responseText({},403,'参数错误'));
    }
    for(let i=0;i<stuIdArr.length;i++){
        const stu_name=await sql.query(`SELECT stu_name from student WHERE stu_id='${stuIdArr[i]}'`);
        const res=await sql.query(`SELECT COUNT(*) x,AVG(deal_money) y FROM consumption WHERE stu_id="${stuIdArr[i]}"`);
        const x=res[0]['x']>200?res[0]['x']:res[0]['x']*(-1);
        const y=res[0]['y']<-100?res[0]['y']*(-1):res[0]['y']*(-10);
        stuRes.push({stu_id:stuIdArr[i],stu_name:stu_name[0]['stu_name']||'',x,y})
    }

    response.send(responseText(stuRes))

})

dataRouter.post("/getKChart",async (_,response)=>{
    const {subExams}=_.params;
    const {class_term,stuIdArr}=_.body;
    const stuRes=[];
    if(!stuIdArr||stuIdArr.length==0){
        return response.send(responseText({},403,'参数错误'));
    }

    for (let i = 0; i < stuIdArr.length; i++) {
        const stu_name=await sql.query(`SELECT stu_name from student WHERE stu_id='${stuIdArr[i]}'`);
        const stu_score=await sql.query(`SELECT exam_name,exam_sub_name,mes_Score FROM chengji WHERE stu_id="${stuIdArr[i]}"`);
        const stuObj={stu_id:stuIdArr[i],stu_name:stu_name[0]['stu_name'],sub_exam:{}};
        const exam=stuObj['sub_exam'];
        stu_score.forEach((it)=>{
            if(exam[it['exam_sub_name']]){
                /*存入学科成绩*/
                exam[it['exam_sub_name']]['exam_score'].push(it['mes_Score']);
                /*存入考试名称*/
                exam[it['exam_sub_name']]['exam_name_arr'].push(it['exam_name']);
            }else{
                exam[it['exam_sub_name']]={exam_score:[],exam_name_arr:[]};
            }
        })
        stuRes.push(stuObj);
    }
    /*
    {
        stu_name:"",
        stu_id:"",
        sub_exam:{
            '体育':{
                exam_score:[],
                exam_name:[]
            }
        }
    }
    */
    response.send(responseText(stuRes));
})
module.exports=dataRouter;