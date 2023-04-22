import Entity from "@App/model/Entity";
import Table from "@App/model/relational/table";
import FileTemplateService from "./FileTemplateService";
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
      if (template.isPerEntity) {
        for (const entity of this.context.entities) {
          const result = velocityjs.render(template.getContent(), { entity: entity }, {});
          const cleanedResult = result
            .replace(/(\r)/gm, "")
            .replace(/(\n\n)/gm, "\n")
            .replace(/(\n\n)/gm, "\n");
          fse.outputFile(template.getOutput(entity.name), cleanedResult, { encoding: "utf8" });
        }
      } else {
        const result = velocityjs.render(template.getContent(), this.context, {});
        const cleanedResult = result.replace(/(\r)/gm, "").replace(/(\n\n)/gm, "\n");
        fse.outputFile(template.getOutput(), cleanedResult, { encoding: "utf8" });
      }
    }
  }
}
