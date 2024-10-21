const fs = require("fs");
const path = require("path");

const GetCounter = (filename, filterFn) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(
      __dirname,
      "../Data Access Layer",
      `${filename}.json`
    );

    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        return reject("Error reading data file.");
      }
      if (!data || data.trim() === "") {
        return resolve(0);
      }

      let dataObj;
      try {
        dataObj = JSON.parse(data);
      } catch (parseError) {
        return reject("Error parsing data file.");
      }

      if (!Array.isArray(dataObj) || dataObj.length === 0) {
        return resolve(0);
      }

      const filteredData = dataObj.filter(filterFn);
      resolve(filteredData.length);
    });
  });
};


module.exports = GetCounter;
