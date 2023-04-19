import chai, { expect } from "chai";
import { GenerationContext } from "@App/core/TemplateEngine";
// import { Template } from "@App/core/fst/FileTemplateService";
import Template from "@App/core/fst/Template";
import exp from "constants";

describe("FileTemplateService Tests", () => {
  let input1: string;
  let input2: string;
  let input3: string;
  beforeAll(() => {
    chai.use(require("chai-string"));
    input1 = GenerationContext.tempaltePath + "test\\single\\single.test1.ts.vm";
    input2 = GenerationContext.tempaltePath + "test\\entities\\entity.test1.ts.vm";
    input3 =
      GenerationContext.tempaltePath + "test\\entities\\subfolder\\entity-something\\entity-named-folder.test.ts.vm";
  });

  it("Simple input / output expecteds", async () => {
    const RESULT_BASE_PATH = "..\\generated\\policial\\src";

    let template = new Template(input1, RESULT_BASE_PATH);
    expect(template.getFileName()).to.be.equals("single.test1.ts.vm");
    expect(template.isSingle()).to.be.true;
    expect(template.isPerEntity()).to.be.false;
    expect(template.getOutput()).to.be.equals("..\\generated\\policial\\src\\single.test1.ts");
    expect(template.getContent()).to.be.equals("1");

    template = new Template(input2, RESULT_BASE_PATH);
    expect(template.getFileName()).to.be.equals("entity.test1.ts.vm");
    expect(template.isSingle()).to.be.false;
    expect(template.isPerEntity()).to.be.true;
    expect(template.getOutput("Mock")).to.be.equals("..\\generated\\policial\\src\\Mock.test1.ts");
    expect(template.getContent()).to.be.equals("2");

    template = new Template(input3, RESULT_BASE_PATH);
    expect(template.getFileName()).to.be.equals("entity-named-folder.test.ts.vm");
    expect(template.isSingle()).to.be.false;
    expect(template.isPerEntity()).to.be.true;
    expect(template.getOutput("Mock")).to.be.equals(
      "..\\generated\\policial\\src\\subfolder\\Mock-something\\Mock-named-folder.test.ts"
    );
    expect(template.getContent()).to.be.equals("3");
  });
});
