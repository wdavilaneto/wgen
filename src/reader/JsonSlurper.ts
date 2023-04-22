#! /usr/bin/env node
import Column from "@App/model/relational/column";
import { ColumnPair, Constraint } from "@App/model/relational/constraint";
import Table from "@App/model/relational/table";

class JsonSlurper {
  private toTable(json: any) {
    const table = Object.assign(new Table(), json) as Table;
    table.clearCache();

    const columns: Column[] = [];
    for (let i = 0; i < table.columns.length; i++) {
      const column = Object.assign(new Column(), table.columns[i]);
      column.table = table;
      columns.push(column);
    }
    table.columns.splice(0);
    table.columns.push(...columns);

    const contraints: Constraint[] = [];
    for (const contraint of table.constraints) {
      const constraint = Object.assign(new Constraint(), contraint);
      constraint.table = table;
      contraints.push(constraint);
    }
    table.constraints.splice(0);
    table.constraints.push(...contraints);
    return table;
  }

  toTables(json: Table[]): Table[] {
    const tables: Table[] = [];
    const tableMap: { [key: string]: Table } = {};

    for (const each of json) {
      const table = this.toTable(each);
      tableMap[table.name] = table;
      tables.push(table);
    }

    // re-link refered columns
    for (const table of tables) {
      for (const contraint of table.constraints) {
        contraint.table = tableMap[contraint.table.name];
        contraint.referedTable = tableMap[contraint.referedTable.name];
        for (const pair of contraint.columnPairs) {
          const referedTable = tableMap[pair.referedColumn.table.name];
          const referedColumnFormReferedTable = referedTable.getColumnByName(pair.referedColumn.name);
          pair.column = table.getColumnByName(pair.column.name);
          if (referedColumnFormReferedTable) {
            pair.referedColumn = referedColumnFormReferedTable;
          } else {
            console.error("Refered column " + pair.referedColumn.name + " not found in table " + referedTable.name);
          }
        }
      }
    }

    return tables;
  }
}

export default JsonSlurper;
