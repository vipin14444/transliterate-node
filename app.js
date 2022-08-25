const { default: axios } = require("axios");
const writeXlsxFile = require("write-excel-file/node");
const fs = require("fs");
const dataset = require("./dataset");
const nativeLanguage = require("./nativeLanguage");
const language = require("./language");

const transliterate = async (word, targetLang) => {
  console.log({ word, targetLang });
  var config = {
    method: "get",
    url: `https://inputtools.google.com/request?text=${word}&itc=${targetLang}-t-i0-und&num=1`,
    headers: {},
  };

  try {
    let response = await axios(config);
    let data = response.data;
    const [status, res] = data;

    if (status === "SUCCESS") {
      console.log(res);
      const [[input, outputArray]] = res;
      const [output] = outputArray;
      return { input, output };
    }
  } catch (error) {
    console.log(error);
  }
};

const writeToExcel = async (data, schema, filePath) => {
  await writeXlsxFile(data, {
    schema,
    filePath,
  });
};

const init = async () => {
  let resultJson = [];
  let errorJson = [];
  for (let i = 0; i < dataset.length; i++) {
    let element = dataset[i];
    try {
      let lang = nativeLanguage[element.admin_name];
      let targetLanguage = language[lang];
      let word = element.city;
      const data = (await transliterate(word, targetLanguage)) ?? {};
      element.search = data.output;
      console.log(`Processed: ${element.city} | Result: ${element.search}`);
      resultJson.push(element);
    } catch (err) {
      console.log(`Error: ${element.city}`);
      errorJson.push(element);
    }
  }
  fs.writeFile("result.json", JSON.stringify(resultJson), "utf8", () => {
    console.log("Done writing result.");
  });
  fs.writeFile("error.json", JSON.stringify(errorJson), "utf8", () => {
    console.log("Done writing errors.");
  });
};

init();
