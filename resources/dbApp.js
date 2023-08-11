const AWS = require("aws-sdk");

exports.handler = async function (event, context) {
  console.log("Received event:", JSON.stringify(event, null, 2));
  const dynamodb = new AWS.DynamoDB();

  try {
    const e = event.Records[0].Sns;
    console.log(process.env.TABLE_NAME);
    const params = {
      TableName: process.env.TABLE_NAME,
      Item: {
        id: {
          S: JSON.stringify(e.MessageId),
        },
        message: {
          S: JSON.stringify(e.Message),
        },
      },
    };
    await dynamodb.putItem(params).promise();
  } catch (err) {
    console.error("Error:", err);
  }
};
