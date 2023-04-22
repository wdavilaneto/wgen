#! /usr/bin/env node
import fs from "fs";
import TableEntityMapper from "./core/TableEntityMapper";
import TemplateEngine, { GenerationContext } from "./core/template/TemplateEngine";
import jc from "json-cycle";
import OracleRetriever from "./reader/oracle/OracleLoader";
import JsonSlurper from "./reader/JsonSlurper";

async function bootstrap() {
  const t2e = new TableEntityMapper();

  const origin = "oracle";
  let tables: any[] = [];
  if (origin !== "oracle") {
    const loader = new OracleRetriever();
    tables = await loader.findTables("MIRP");
    fs.writeFileSync("result.json", JSON.stringify(jc.decycle(tables)));
  } else {
    const jsonTables = jc.retrocycle(JSON.parse(fs.readFileSync("result.json", "utf8")));
    const slurper = new JsonSlurper();
    tables = slurper.toTables(jsonTables);
  }
  const entities = t2e.generateModel(tables);
  // fs.writeFileSync("entities.json", JSON.stringify(jc.decycle(entities)));
  // console.log(entities);
  // outputPath: "..\\generated\\policial\\apps\\policial\\src",
  const context: GenerationContext = {
    archetype: "nestjs",
    outputPath: "..\\generated\\policial\\apps\\policial\\src",
    entities: entities,
    tables: tables,
  };
  const engine = new TemplateEngine(context);
  engine.run();
  // engine.run();
  console.log("Done!");
}

bootstrap();

export default bootstrap;
