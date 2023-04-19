import Entity from "../Entity";
import Column from "./column";
import { Constraint } from "./constraint";

function checker(arr: any, target: any) {
  return target.every((v: any) => arr.includes(v));
}

class Table {
  name?: string;
  comment?: string;
  owner?: string;
  sequenceNam?: string;
  inheritanceTable?: Table;

  private _prefix?: string = undefined;
  private _pk?: Column[] = undefined;

  entity?: Entity; // circular reference

  constructor(public columns: Column[] = [], public constraints: Constraint[] = []) {}

  getPk() {
    if (!this._pk) {
      const pks: Column[] = this.columns.filter((column: Column) => column.isKey());
      if (pks.length > 0) {
        this._pk = pks;
      } else {
        this._pk = [];
      }
    }
    return this._pk;
  }

  getPrefix() {
    if (this._prefix) return this._prefix;
    if (this.name) {
      const splited = this.name.split("_");
      if (splited.length > 0 && splited[0] === this.owner) {
        this._prefix = this.owner;
        return this._prefix;
      }
      if (this.getPk()[0]) {
        this._prefix = this.getPk()[0].getPrefix();
        return this._prefix;
      }
    }
    this._prefix = "";
    return this._prefix;
  }

  private _isNamRelationship: boolean | undefined = undefined;

  public isNmRelationShip(): boolean {
    if (!this._isNamRelationship) {
      // TODO R to enum / Relationship
      const fkContraints = this.constraints.filter((constraint: Constraint) => constraint.type === "R");
      if (fkContraints.length < 2) {
        return false;
      }
      const cols: Column[] = [];
      fkContraints.forEach((fk: Constraint) => {
        cols.push(...fk.getThisSideColumns());
      });
      const pk = this.getPk();
      const mainColumns = cols.concat(pk);

      if (checker(mainColumns, this.columns) && this.columns.length === 3) {
        this._isNamRelationship = true;
      } else {
        if (pk.toString() === cols.toString()) {
          const colsCopy = [...this.columns];
          const diff = colsCopy.filter((x) => !pk.includes(x)); // cols.removeAll(pk)
          diff.forEach((col: Column) => {
            // TODO Ver padrao de infra para campos default SYSDATE
            if (!col.name?.endsWith("DT_ULT_ALTERACAO") || !col.name.endsWith("DT_INCLUSAO")) {
              this._isNamRelationship = false;
            }
          });
          this._isNamRelationship = true;
        }
      }
    }
    if (this._isNamRelationship === undefined) {
      this._isNamRelationship = false;
    }
    return this._isNamRelationship;
  }

  getColumnByName(name: string): Column | undefined {
    return this.columns.find((column: Column) => column.name === name);
  }

  clearCache() {
    this._isNamRelationship = undefined;
    this._prefix = undefined;
    this._pk = undefined;
    this.entity = undefined;
  }
}

export default Table;
