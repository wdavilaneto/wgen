import * as fs from "fs";
import { readdir } from "node:fs/promises";
import { GenerationContext, GenerationType } from "../TemplateEngine";
import { join } from "node:path";
import Template from "./Template";
// import fse from "fs-extra";

export default class FileTemplateService {
  private archetypePath: string;

  constructor(private context: GenerationContext) {
    this.archetypePath = GenerationContext.tempaltePath + this.context.archetype;
  }

  async getAllTemplates() {
    const allFiles = await this.walk(this.archetypePath);
    const templates = allFiles.flat(Number.POSITIVE_INFINITY);
    const filteredTemplates = templates.filter((file: any) => file.endsWith(".vm"));
    const result: Template[] = [];
    for (const each of filteredTemplates) {
      result.push(new Template(each, this.context.outputPath));
    }
    return result;
  }

  private async walk(dirPath: string) {
    return Promise.all(
      await readdir(dirPath, { withFileTypes: true }).then((entries: any) =>
        entries.map((entry: any) => {
          const childPath = join(dirPath, entry.name);
          return entry.isDirectory() ? this.walk(childPath) : childPath;
        })
      )
    );
  }
}
