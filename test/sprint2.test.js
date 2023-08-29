const cdk = require("aws-cdk-lib");
const { Template } = require("aws-cdk-lib/assertions");
const Sprint2 = require("../lib/sprint2-stack");

// example test. To run these tests, uncomment this file along with the
// example resource in lib/sprint2-stack.js
// test("SQS Queue Created", () => {
//   const app = new cdk.App();
//   // WHEN
//   const stack = new Sprint2.Sprint2Stack(app, "MyTestStack");
//   // THEN
//   const template = Template.fromStack(stack);

//   template.hasResourceProperties("AWS::SQS::Queue", {
//     VisibilityTimeout: 300,
//   });
// });

test("test_lambda_count", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Sprint2.Sprint2Stack(app, "testStack");
  // THEN
  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::Lambda::Function", 2);
});

test("test_sns_count", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Sprint2.Sprint2Stack(app, "testStack");
  // THEN
  const template = Template.fromStack(stack);

  template.resourceCountIs("AWS::SNS::Topic", 1);
});
