// const { Stack, pipelines, SecretValue } = require("aws-cdk-lib");
// const { Construct } = require("constructs");

// class MKPipelineStack extends Stack {
//   /**
//    *
//    * @param {Construct} scope
//    * @param {string} id
//    * @param {StackProps=} props
//    */
//   constructor(scope, id, props) {
//     super(scope, id, props);

//     // Access the CommitId of a GitHub source in the synth
//     const source = pipelines.CodePipelineSource.gitHub(
//       "murtazakhan2595/Web-Health-Stack",
//       "main",
//       {
//         authentication: SecretValue.secretsManager("GITHUB_TOKEN"),
//         // trigger: "POLL",
//       }
//     );
//     const pipeline = new pipelines.CodePipeline(this, "mkPipeline", {
//       synth: new pipelines.ShellStep("mkSynth", {
//         // Use a connection created using the AWS console to authenticate to GitHub
//         // Other sources are available.
//         input: source,
//         installCommands: ["npm install -g aws-cdk"],

//         commands: ["ls", "npm ci", "npm run build", "npx cdk synth"],
//         primaryOutputDirectory: "/cdk.out",
//       }),
//     });
//     // const synth = new pipelines.ShellStep("synth", {
//     //   input: source,
//     //   commands: ["ls", "npm install -g aws-cdk", "npm install", "cdk synth"],
//     //   primaryOutputDirectory: "/cdk.out",
//     // });
//     // const pipeline = new pipelines.CodePipeline(this, "MKPipeline", {
//     //   synth: synth,
//     // });
//   }
// }

// import { Stack, StackProps, pipelines, SecretValue } from "aws-cdk-lib";
// import { Construct } from "constructs";
// import { PipelineSage } from "./pipelines-stage";
const { Stack } = require("aws-cdk-lib");
const { Construct } = require("constructs");
const { pipelines, SecretValue } = require("aws-cdk-lib");
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

        commands: ["npm ci", "npx cdk synth"],
        primaryOutputDirectory: "cdk.out",
      }),
    });
  }
}

module.exports = { MKPipelineStack };
