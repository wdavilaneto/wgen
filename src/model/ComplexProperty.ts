import Entity, { Clazz } from "./Entity";
import { Constraint } from "./relational/constraint";
import Table from "./relational/table";
import patternConverter from "@App/core/PatternConverter";

export default class ComplexProperty extends Clazz {
  referedEntity: Entity;
  nmTable?: Table;
  constraint: Constraint;
  mappedBy?: string;

  constructor(referedEntity: Entity, constraint: Constraint = null) {
    super();
    this.referedEntity = referedEntity;
    this.name = patternConverter.getPropertyName(referedEntity.name);
    if (constraint) {
      this.constraint = constraint;
    }
  }

  public isOneToMany(): boolean {
    return !this.constraint;
  }

  public isManyToOne(): boolean {
    return this.constraint && !this.isManyToMany();
  }

  public isManyToMany(): boolean {
    return this.nmTable ? true : false;
  }

  public getInverseConstraint(): Constraint | undefined {
    return this.nmTable?.constraints[0] !== this.constraint
      ? this.nmTable?.constraints[0]
      : this.nmTable?.constraints[1];
  }

  public getType(): string | undefined {
    return this.referedEntity?.name;
  }

  getSnakeCaseType(): string {
    return patternConverter.toSnakeCase(this.getType());
  }
}
