const { Stage } = require("aws-cdk-lib");
const { Sprint2Stack } = requrie("../lib/sprint2-stack.js");

class MKStage extends Stage {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    this.stage = new Sprint2Stack(this, "mkStage");
  }
}
