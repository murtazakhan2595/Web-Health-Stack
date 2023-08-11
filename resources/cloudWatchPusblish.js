const AWS = require("aws-sdk");

class AwsCloudWatch {
  publishMetrics(nameSpace, metricName, dimentions, metricValue) {
    const cloudwatch = new AWS.CloudWatch();
    const params = {
      MetricData: [
        {
          MetricName: metricName,
          Dimensions: dimentions,
          Value: metricValue,
        },
      ],
      Namespace: nameSpace,
    };
    cloudwatch.putMetricData(params, function (err, data) {
      if (err) {
        console.log("Error publishing metrics:", err);
      } else {
        console.log("Metrics published successfully:", data);
      }
    });
  }
}

module.exports = AwsCloudWatch;
