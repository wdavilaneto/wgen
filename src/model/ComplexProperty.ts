import Entity, { Clazz } from "./Entity";
import { Constraint } from "./relational/constraint";
import Table from "./relational/table";
import PatternConverter from "@App/core/PatternConverter";

const patternConverter = new PatternConverter();

export default class ComplexProperty extends Clazz {
  referedEntity?: Entity;
  nmTable?: Table;
  constraint?: Constraint;
  mappedBy?: string;

  constructor(referedEntity: Entity, constraint?: Constraint) {
    super();
    this.referedEntity = referedEntity;
    this.name = patternConverter.getPropertyName(referedEntity.name) + "Collection";
    if (constraint) {
      this.constraint = constraint;
    }
  }

  public isOneToMany(): boolean {
    return this.constraint === null;
  }

  public isManyToOne(): boolean {
    return this.constraint != null && !this.isManyToMany();
  }

  public isManyToMany(): boolean {
    return this.nmTable != null;
  }

  public getInverseConstraint(): Constraint | undefined {
    return this.nmTable?.constraints[0] != this.constraint
      ? this.nmTable?.constraints[0]
      : this.nmTable?.constraints[1];
  }

  public getType(): string | undefined {
    return this.referedEntity?.name;
  }
}
