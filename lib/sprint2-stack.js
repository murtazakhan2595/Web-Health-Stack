const { Stack, Duration, RemovalPolicy } = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const events = require("aws-cdk-lib/aws-events");
const target = require("aws-cdk-lib/aws-events-targets");
const cloudwatch = require("aws-cdk-lib/aws-cloudwatch");
const constants = require("../resources/constants.js");
const iam = require("aws-cdk-lib/aws-iam");
const sns = require("aws-cdk-lib/aws-sns");
const snsSubscriptions = require("aws-cdk-lib/aws-sns-subscriptions");
const cwActions = require("aws-cdk-lib/aws-cloudwatch-actions");
const db = require("aws-cdk-lib/aws-dynamodb");

class Sprint2Stack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    // creating role for web health lambda
    const wHLambdaRole = this.create_lambda_role(
      "wHLambdaCloudWatchRole",
      "granting full access of aws cloudWatch to expressLambda"
    );

    // defines an Aws Lambda Resource to deploy whApp.js
    const fn = this.createLambda(
      "whLambda",
      "./resources",
      "whApp.handler",
      wHLambdaRole
    );
    fn.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // creating role for db lambda
    const dBLambdaRole = this.create_lambda_role(
      "dBLambdaCloudWatchRole",
      "granting full access of aws dynamoDB to dbLambda"
    );
    // database lambda function need permissions to write on dynamodb
    dBLambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess")
    );

    // creating second lambda function to deploy data to db
    const dbFn = this.createLambda(
      "dbLambda",
      "./resources",
      "dbApp.handler",
      dBLambdaRole
    );
    dbFn.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // defining alias:
    const version = fn.currentVersion;
    const alias = new lambda.Alias(this, "LambdaAlias", {
      aliasName: "Prod",
      version,
    });

    const schedule = events.Schedule.rate(Duration.minutes(1));
    const targets = [new target.LambdaFunction(fn)];
    // defineing a rule to convert my lambda into cronjob
    const rule = new events.Rule(this, "whAppRule", { schedule, targets });
    rule.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // creating alarm for metrics availibility and latency
    const availabilityMetric = new cloudwatch.Metric({
      metricName: constants.availabilityMetric,
      namespace: constants.namespace,
      dimensions: { url: constants.url },
    });
    const availabilityAlarm = new cloudwatch.Alarm(
      this,
      "availabilityAlarmError",
      {
        evaluationPeriods: 1,
        metric: availabilityMetric,
        threshold: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
        actionsEnabled: true,
      }
    );

    const latencyMetric = new cloudwatch.Metric({
      metricName: constants.latencyMetric,
      namespace: constants.namespace,
      dimensions: { url: constants.url },
    });
    const latencyAlarm = new cloudwatch.Alarm(this, "latencyAlarmError", {
      evaluationPeriods: 1,
      metric: latencyMetric,
      threshold: 0.1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      actionsEnabled: true,
    });

    // creating a notification system using sns
    const topic = new sns.Topic(this, "whNotifications", {
      topicName: "MurtazaDBLambdaSNSTopic",
    });
    // adding email subscription
    // topic.addSubscription(
    //   new snsSubscriptions.EmailSubscription("murtazakhan2595@gmail.com")
    // );

    //  adding lambda subscription
    topic.addSubscription(new snsSubscriptions.LambdaSubscription(dbFn));

    availabilityAlarm.addAlarmAction(new cwActions.SnsAction(topic));
    latencyAlarm.addAlarmAction(new cwActions.SnsAction(topic));

    // creating dynamodb table
    const snsTable = new db.Table(this, "snsTable", {
      partitionKey: { name: "id", type: db.AttributeType.STRING },
    });
    snsTable.applyRemovalPolicy(RemovalPolicy.DESTROY);

    // stroring table name to environment variable of database lambda
    dbFn.addEnvironment("TABLE_NAME", snsTable.tableName);
  }

  createLambda(id, asset, handler, lambdaRole) {
    return new lambda.Function(this, id, {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset(asset),
      handler,
      role: lambdaRole,
    });
  }
  create_lambda_role(id, description) {
    const lambdaRole = new iam.Role(this, id, {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      description: description,
    });
    // I want to assign cloudwatch access to every lambda
    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess")
    );
    return lambdaRole;
  }
}

module.exports = { Sprint2Stack };
