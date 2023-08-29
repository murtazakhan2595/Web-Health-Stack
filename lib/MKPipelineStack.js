const { Stack } = require("aws-cdk-lib");
const { Construct } = require("constructs");
const { pipelines, SecretValue } = require("aws-cdk-lib");
const { MKStage } = require("./MKStage");

class MKPipelineStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // defining source of pipeline i.e github repo
    const source = pipelines.CodePipelineSource.gitHub(
      "murtazakhan2595/Web-Health-Stack",
      "main",
      {
        authentication: SecretValue.secretsManager("GITHUB_TOKEN"),
      }
    );

    const pipeline = new pipelines.CodePipeline(this, "MKPipeline", {
      synth: new pipelines.ShellStep("MKSynth", {
        // Use a connection created using the AWS console to authenticate to GitHub
        // Other sources are available.
        input: source,
        installCommands: ["npm install -g aws-cdk"],

        commands: ["ls", "npm ci", "npx cdk synth", "ls"],
        primaryOutputDirectory: "cdk.out",
      }),
    });

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.Stage.html
    const betaTesting = new MKStage(this, "Beta");
    pipeline.addStage(betaTesting, {
      pre: [
        new pipelines.ShellStep("Running unit Tests", {
          input: source,
          installCommands: ["npm install -g aws-cdk"],
          commands: ["ls", "npm ci", "npm test"],
        }),
      ],
    });

    const prod = new MKStage(this, "Prod");
    pipeline.addStage(prod, {
      pre: [new pipelines.ManualApprovalStep("PromoteToProd")],
    });
  }
}

module.exports = { MKPipelineStack };
