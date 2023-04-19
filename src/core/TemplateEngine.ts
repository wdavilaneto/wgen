import Entity from "@App/model/Entity";
import Table from "@App/model/relational/table";
import FileTemplateService from "./fst/FileTemplateService";
import velocityjs from "velocityjs";
import fse from "fs-extra";

export class GenerationContext {
  static tempaltePath: string = "assets\\templates\\";
  archetype: string = "example";
  outputPath: string = "..\\generated\\policial\\apps\\policial\\src";
  entities?: Entity[];
  tables?: Table[];
  loader?: string;
}

export class GenerationType {
  static ENTITY = "\\entities";
  static SINGLE = "\\single";
}

export default class TemplateEngine {
  private fileTemaplte: FileTemplateService;
  private archetypePath: string;

  constructor(private context: GenerationContext) {
    const BASE_PATH = "templates\\";
    this.archetypePath = BASE_PATH + this.context.archetype;
    this.fileTemaplte = new FileTemplateService(context);
  }

  public async run() {
    const templates = await this.fileTemaplte.getAllTemplates();
    for (const template of templates) {
      // if (this.fileTemaplte.getOutputPath(template.getOutput()).startsWith(GenerationType.ENTITY)) {
      //   const output = this.fileTemaplte.getOutput(template, GenerationType.ENTITY);
      //   for (const entity of this.context.entities) {
      //     const vm = this.fileTemaplte.getTemplate(template);
      //     const finalOutput = output.replace("entity", entity.name).replace(".vm", ".ts");
      //     console.log(template, finalOutput);
      //     // const result = velocityjs.render(vm, { entity: entity }, {});
      //     // fse.outputFile(this.getOutput(template), result);
      //   }
      // } else if (this.fileTemaplte.getOutputPath(template).startsWith(GenerationType.SINGLE)) {
      //   const output = this.fileTemaplte.getOutput(template, GenerationType.SINGLE);
      //   const vm = this.fileTemaplte.getTemplate(template);
      //   console.log(template, output);
      //   // const result = velocityjs.render(vm, this.context, {});
      //   // fse.outputFile(this.getOutput(template), result);
      // } else {
      //   console.log("Template (Root) not supported", this.fileTemaplte.getOutputPath(template));
      // }
    }
  }
}
