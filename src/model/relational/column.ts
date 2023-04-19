import Table from "./table";

class Column {
  id?: number;
  name?: string;
  type?: string;
  length?: number;
  precision?: number;
  scale?: number;
  nullable?: boolean = false;
  position?: number;
  comment?: string;
  defaultValue?: string;
  unique?: boolean = false;
  generated?: boolean = false;
  useUUID?: boolean = false;

  checkValues?: string[];
  // RelationShips?: any; // Bidirectional
  // simpleProperty?: any; // RelationshipProperty

  relations?: any;
  table?: Table;

  private _prefix?: string = undefined;

  isUpdatable() {
    if (this.defaultValue === "now()" || (this.defaultValue === "SYSDATE" && !this.nullable)) {
      return false;
    }
    return true;
  }
  isInserable() {
    return this.isUpdatable(); // TODO change this...
  }
  isKey() {
    return this.position != null;
  }
  getPrefix(): string {
    if (this._prefix) return this._prefix;
    this._prefix = "";
    if (!this.table || !this.table.name || !this.name) return this._prefix;

    const tablePrefix = this.table.name.split("_")[0];
    if (tablePrefix === this.name.split("_")[0]) {
      this._prefix = tablePrefix;
      return this._prefix;
    }
    if (this.name?.split("_")[0] === this.table.owner) {
      this._prefix = this.table.owner;
      return this._prefix;
    }
    const pkZero = this.table.getPk()[0];
    if (!this.isKey() && pkZero) {
      const pkPrefix = pkZero.name?.split("_")[0];
      if (pkPrefix === this.name?.split("_")[0]) {
        this._prefix = pkPrefix;
        return this._prefix;
      }
    }
    return this._prefix;
  }
}

export default Column;
