import { PatternConverter } from "@App/core/PatternConverter";
import chai, { expect } from "chai";

describe("FileTemplateService Tests", () => {
  let patternConverter: PatternConverter;
  beforeAll(() => {
    chai.use(require("chai-string"));

    patternConverter = new PatternConverter();
    // ...
  });
  it("From assets/templates/test archetype ate least 6 files with vm extension", async () => {
    expect(patternConverter.getPropertyName("TEST_TEST")).to.be.equal("testTest");
  });
});
