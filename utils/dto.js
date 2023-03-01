module.exports = responseText = function (data = {}, code = 200, msg = "ok") {
    return {
      code,
      data,
      msg,
    };
  };