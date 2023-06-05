import patternConverter from "../core/PatternConverter";
import Entity, { Clazz } from "./Entity";
import Column from "./relational/column";
import { Constraint } from "./relational/constraint";
import Table from "./relational/table";

export default class RelationshipProperty extends Clazz {
  // column: Column;
  // entity: Entity;
  nullable: boolean = true;

  constructor(public column: Column, public entity: Entity) {
    super();
  }

  getType(): string {
    return patternConverter.getTypeName(this.column);
  }

  getJavaType(): string {
    return patternConverter.getTypeName(this.column, "java");
  }
  getSnakeCaseType(): string {
    return patternConverter.toSnakeCase(this.getType());
  }
  getApiPattern(): string {
    return patternConverter.toSnakeCase(this.name, "_");
  }
}
