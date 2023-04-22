import * as fs from "fs";
import { GenerationContext, GenerationType } from "./TemplateEngine";
import patternConverter from "../PatternConverter";

export default class Template {
  private path: string;
  private filename: string;
  private name: string;
  private outputPath: string;
  private archetype: string;

  constructor(template: string, outputBasePath: string) {
    this.path = template.substring(0, template.lastIndexOf("\\"));
    this.filename = template.split("\\").pop();
    this.name = this.path + "\\" + this.filename;
    const base = this.path.replace(GenerationContext.tempaltePath, "");
    this.archetype = base.split("\\")[0];
    this.outputPath = outputBasePath + base.replace(this.archetype, "");
  }

  getOutput(name?: string) {
    let resultPath: string;
    if (this.isPerEntity() && name !== undefined) {
      const snakeCaseName = patternConverter.toSnakeCase(name);
      resultPath = this.outputPath.replace(GenerationType.ENTITY, "").replaceAll("entity", snakeCaseName);
      return resultPath + "\\" + this.filename.replace("entity", snakeCaseName).replace(".vm", "");
    } else {
      resultPath = this.outputPath.replace(GenerationType.SINGLE, "");
      return resultPath + "\\" + this.filename.replace(".vm", "");
    }
  }
  getCompleteFileName() {
    return this.path + "\\" + this.filename;
  }
  getContent() {
    return fs.readFileSync(this.getCompleteFileName(), { encoding: "utf8" }).toString();
  }
  isPerEntity() {
    return this.outputPath.includes(GenerationType.ENTITY);
  }
  isSingle() {
    return !this.isPerEntity();
  }
  getFileName() {
    return this.filename;
  }
}
