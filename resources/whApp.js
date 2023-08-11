const https = require("https");
const AwsCloudWatch = require("./cloudWatchPusblish");
const constants = require("./constants.js");

exports.handler = async function (event) {
  let values = {
    availability: await getAvailability(constants.url),
    latency: await getLatency(constants.url),
  };
  const awsCloudWatch = new AwsCloudWatch();

  awsCloudWatch.publishMetrics(
    constants.namespace,
    constants.availabilityMetric,
    [{ Name: "url", Value: constants.url }],
    values.availability
  );

  awsCloudWatch.publishMetrics(
    constants.namespace,
    constants.latencyMetric,
    [{ Name: "url", Value: constants.url }],
    values.latency
  );
  return values;
};

const getAvailability = (url) => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        resolve(1);
      } else {
        resolve(0);
      }
    });
    req.on("error", (error) => {
      resolve(0);
    });
  });
};

const getLatency = (url) => {
  return new Promise((resolve, reject) => {
    let startDate = Date.now();
    const req = https.get(url, (res) => {
      resolve((Date.now() - startDate) / 1000);
    });
    req.on("error", (error) => {
      resolve(-1); // Use a negative value to indicate an error.
    });
  });
};
