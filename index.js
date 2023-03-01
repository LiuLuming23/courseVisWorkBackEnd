const { csvParse } = require("json2csv");
const jsonParse = require("csvtojson");
const fs = require("fs");
const sql = require("./db/index");

function getCsv(params) {
  return new Promise((resolve, reject) => {
    jsonParse()
      .fromFile(`./data/${params}.csv`)
      .then((jsonObj) => {
        resolve(jsonObj);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
function addData(sqlStr, data) {
  return new Promise((resolve, reject) => {
    sql.query(sqlStr, [data], (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}
async function handelStuData() {
  const stuObj = await getCsv("student");
  const data = [];
  stuObj.forEach((it) => {
    it["bf_zhusu"] = it["bf_zhusu"] * 1;
    it["bf_leaveSchool"] = it["bf_leaveSchool"] * 1;
    it["cla_grade"] = parseInt(it["cla_grade"]);
    data.push([
      it["stu_id"],
      it["stu_name"],
      it["stu_sex"],
      it["cla_id"],
      it["cla_school"],
      it["cla_grade"],
      it["cla_name"],
      it["bf_zhusu"],
      it["bf_leaveSchool"],
      it["bf_qinshihao"],
    ]);
  });
  const sqlStr =
    "INSERT INTO `student` (`stu_id`,`stu_name`,`stu_sex`,`cla_id`,`cla_school`,`cla_grade`,`cla_name`,`bf_zhusu`,`bf_leaveSchool`,`bf_qinshihao`) VALUES ?";
  const affectsRes = await addData(sqlStr, data);
  console.log(affectsRes);
}

async function handelKaoQinData() {
  const stuObj = await getCsv("kaoqin");
  const data = [];
  stuObj.forEach((it) => {
    it["kq_controllerID"] = it["kq_controllerID"] * 1;
    data.push([
      it["kq_id"],
      it["kq_term"],
      it["kq_dateTime"],
      it["kq_controllerID"],
      it["stu_id"],
      it["stu_name"],
      it["cla_id"],
      it["cla_name"],
    ]);
  });

  const sqlStr =
    "INSERT INTO `kaoqin` (`kq_id`,`kq_term`,`kq_dateTime`,`kq_controllerID`,`stu_id`,`stu_name`,`cla_id`,`cla_name`) VALUES ?";
  const affectsRes = await addData(sqlStr, data);
  console.log(affectsRes);
}
async function handelConsumptionData() {
  const stuObj = await getCsv("consumption");
  const data = [];
  stuObj.forEach((it) => {
    it["deal_money"] = parseFloat(it["deal_money"]);
    data.push([
      it["deal_term"],
      it["deal_money"],
      it["stu_id"],
      it["stu_name"],
      it["stu_sex"],
    ]);
  });
  let subData;
  let chuck = Math.ceil(data.length / 80000);
  const sqlStr =
    "INSERT INTO `consumption` (`deal_term`,`deal_money`,`stu_id`,`stu_name`,`stu_sex`) VALUES ?";
  for (let i = 0; i < chuck; i++) {
    if (i == chuck - 1) {
      subData = data.slice(i * 80000);
    } else {
      subData = data.slice(i * 80000, 80000 * (i + 1));
    }
    const affectsRes = await addData(sqlStr, subData);
    console.log(affectsRes);
  }
  console.log("全部插入完成");
}
async function handelChengjiData() {
  const stuObj = await getCsv("chengji");
  const data = [];
  stuObj.forEach((it) => {
    it["mes_Score"] = parseFloat(it["mes_Score"]);
    if(it["mes_Z_Score"]!=''){
      it["mes_Z_Score"]=parseFloat(it["mes_Z_Score"]);
    }else{
      it["mes_Z_Score"]=0;
    }
    if(it["mes_T_Score"]!=''){
      it["mes_T_Score"]=parseFloat(it["mes_T_Score"]);
    }else{
      it["mes_T_Score"]=0;
    }
    if (it["cla_id"] == "-1") {
      it["cla_id"] = "";
    }
    data.push([
      it["exam_testId"],
      it["exam_name"],
      it["exam_sub_name"],
      it["exam_term"],
      it["stu_id"],
      it["cla_name"],
      it["cla_id"],
      it["mes_Score"],
      it["mes_Z_Score"],
      it["mes_T_Score"],
    ]);
  });
  console.log(data);
  let subData;
  let chuck = Math.ceil(data.length / 30000);
  console.log(chuck);
  const sqlStr =
    "INSERT INTO `chengji` (`exam_testId`,`exam_name`,`exam_sub_name`,`exam_term`,`stu_id`,`cla_name`,`cla_id`,`mes_Score`,`mes_Z_Score`,`mes_T_Score`) VALUES ?";
  for(let i=0;i<chuck;i++){
      if(i==chuck-1){
        subData=data.slice(i*30000);
      }else{
        subData=data.slice(i*30000,30000*(i+1));
      }
      const affectsRes=await addData(sqlStr,subData);
      console.log(affectsRes);
  }
  console.log("全部插入完成");
}

/*处理函数*/
handelStuData();

// handelKaoQinData();

// handelConsumptionData();

// handelChengjiData();






// jsonParse()
//   .fromFile("./data/5_chengji.csv")
//   .then((jsonObj) => {
//     // fs.writeFileSync('dataJson.json',JSON.stringify(jsonObj));
//   });
