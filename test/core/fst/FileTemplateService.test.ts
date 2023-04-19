import chai, { expect } from "chai";
import { GenerationContext } from "@App/core/TemplateEngine";
import FileTemplateService from "@App/core/fst/FileTemplateService";
import Template from "@App/core/fst/Template";

describe("FileTemplateService Tests", () => {
  let fileTemaplte: FileTemplateService;
  let templateList: Template[];
  beforeAll(() => {
    chai.use(require("chai-string"));
    const context: GenerationContext = {
      archetype: "test",
      outputPath: "..\\generated\\policial\\src",
    };

    fileTemaplte = new FileTemplateService(context);
    // ...
  });
  it("From assets/templates/test archetype ate least 6 files with vm extension", async () => {
    templateList = await fileTemaplte.getAllTemplates();
    expect(templateList.length).to.be.greaterThan(5);
  });

  it("From same archetype, all files have output", async () => {
    templateList = await fileTemaplte.getAllTemplates();
    for (const template of templateList) {
      console.log(template.getOutput());
      expect(template.getOutput()).to.be.not.empty;
    }
  });
});
