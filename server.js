const express = require("express");
const stuRouter = require("./router/stuRouter.js");
const dataRouter = require("./router/dataRouter.js");
const app = express();
app.use(express.json());
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "content-type");
  res.header("Access-control-allow-methods","GET, POST, OPTIONS, PUT, DELETE");
  next();
});
app.use("/stu", stuRouter);
app.use("/data", dataRouter);
app.listen(10010, () => {
  console.log("启动成功");
});
