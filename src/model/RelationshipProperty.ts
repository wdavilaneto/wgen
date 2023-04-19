import PatternConverter from "../core/PatternConverter";
import Entity, { Clazz } from "./Entity";
import Column from "./relational/column";
import { Constraint } from "./relational/constraint";
import Table from "./relational/table";

const patternConverter = new PatternConverter();

export default class RelationshipProperty extends Clazz {
  column: Column;
  entity: Entity;
  nullable: boolean = true;

  getType(): string {
    return patternConverter.getTypeName(this.column);
  }

  getJavaType(): string {
    return patternConverter.getTypeName(this.column, "java");
  }
}
