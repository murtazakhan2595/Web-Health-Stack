const { Stack, pipelines, SecretValue } = require("aws-cdk-lib");

class MKPipelineStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    // Access the CommitId of a GitHub source in the synth
    const source = pipelines.CodePipelineSource.gitHub(
      "murtazakhan2595/Web-Health-Stack",
      "main",
      {
        authentication: SecretValue.secretsManager("MKToken"),
        trigger: "POLL",
      }
    );
    const synth = new pipelines.ShellStep("synth", {
      input: source,
      commands: ["ls", "npm install -g aws-cdk", "npm install", "cdk synth"],
      primaryOutputDirectory: "/cdk.out",
    });
    const pipeline = new pipelines.CodePipeline(this, "MKPipeline", {
      synth: synth,
    });
  }
}

module.exports = { MKPipelineStack };
