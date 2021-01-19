const {
  ComputerVisionClient,
} = require("@azure/cognitiveservices-computervision");
const { ApiKeyCredentials } = require("@azure/ms-rest-js");

// List of sample images to use in demo
const { RandomImageUrl } = require("./DefaultImages");

// Authentication requirements
const key = process.env.KEY;
const endpoint = process.env.ENDPOINT;

// Cognitive service features
const visualFeatures = [
  "ImageType",
  "Faces",
  "Adult",
  "Categories",
  "Color",
  "Tags",
  "Description",
  "Objects",
  "Brands",
];

const isConfigured = () => {
  const result =
    key && endpoint && key.length > 0 && endpoint.length > 0 ? true : false;
  console.log(`key = ${key}`);
  console.log(`endpoint = ${endpoint}`);
  console.log(`ComputerVision isConfigured = ${result}`);
  return result;
};

// Computer Vision detected Printed Text
const includesText = async (tags) => {
  return tags.filter((el) => {
    return el.name.toLowerCase() === "text";
  });
};
// Computer Vision detected Handwriting
const includesHandwriting = async (tags) => {
  return tags.filter((el) => {
    return el.name.toLowerCase() === "handwriting";
  });
};
// Wait for text detection to succeed
const wait = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};

// Analyze Image from URL
const computerVision = async (url) => {
  // authenticate to Azure service
  const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": key } }),
    endpoint
  );

  // get image URL - entered in form or random from Default Images
  const urlToAnalyze = url || RandomImageUrl();

  // analyze image
  const analysis = await computerVisionClient.analyzeImage(urlToAnalyze, {
    visualFeatures,
  });

  // text detected - what does it say and where is it
  if (includesText(analysis.tags) || includesHandwriting(analysis.tags)) {
    analysis.text = await readTextFromURL(computerVisionClient, urlToAnalyze);
  }

  // all information about image
  return { URL: urlToAnalyze, ...analysis };
};
// analyze text in image
const readTextFromURL = async (client, url) => {
  let result = await client.read(url);
  let operationID = result.operationLocation.split("/").slice(-1)[0];

  // Wait for read recognition to complete
  // result.status is initially undefined, since it's the result of read
  const start = Date.now();

  while (result.status !== "succeeded") {
    await wait(500);
    result = await client.getReadResult(operationID);
  }

  // Return the first page of result.
  // Replace[0] with the desired page if this is a multi-page file such as .pdf or.tiff.
  return result.analyzeResult;
};

module.exports = {
  isConfigured,
  computerVision,
};
