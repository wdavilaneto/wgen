import Column from "./column";
import Table from "./table";

export interface ConstraintDto {
  name: string;
  type: string;
  tableName: string;
  rTableName: string;
  columnName: string;
  rColumnName: string;
  searchCondition: string;
}

export enum ConstraintType {
  Relationship,
  PrimaryKey,
  CodeConstraint,
}
export class ColumnPair {
  constructor(public column: Column, public referedColumn: Column) {}
}

export class Constraint {
  name?: string;
  table?: Table;
  type?: string;

  referedTable?: Table;
  columnPairs: ColumnPair[] = [];
  // tipo: ConstraintType;

  getThisSideColumns(): Column[] {
    return this.columnPairs.map((pair) => pair.column);
  }
  getReferedSideColumns(): Column[] {
    return this.columnPairs.map((pair) => pair.referedColumn);
  }
  isSingleColumn(): boolean {
    return this.columnPairs.length === 1;
  }
  getSingleColumnPair(): ColumnPair {
    return this.columnPairs[0];
  }
}
