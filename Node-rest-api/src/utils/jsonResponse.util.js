const logger = require("../config/logger");

const jsonResponse = (data, status, message) => {
  try {
    const parsedData = JSON.parse(data);
    logger.info("Parsed Data");
    console.log(parsedData);
    return {
      data: parsedData,
      status: status.status,
      message,
    };
  } catch (error) {
    return {
      data,
      status: status.status,
      message,
    };
  }
};

module.exports = { jsonResponse };
