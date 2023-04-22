import Column from "../../model/relational/column";
import { ColumnPair, Constraint } from "../../model/relational/constraint";
import Table from "../../model/relational/table";

export class OracleColumnMapper {
  public static toDomain(element: any): Column {
    const column = new Column();
    column.id = element.COLUMN_ID;
    column.name = element.COLUMN_NAME;
    column.type = element.DATA_TYPE;
    column.length = element.DATA_LENGTH;
    column.precision = element.DATA_PRECISION;
    column.scale = element.DATA_SCALE;
    column.nullable = element.NULLABLE;
    column.position = element.POSITION;
    column.comment = element.COLUMN_COMMENTS;
    return column;
  }
}

export class TableMapper {
  private static toDomain(row: any): Table {
    const table = new Table();
    table.name = row.TABLE_NAME;
    table.comment = row.TABLE_COMMENTS;
    table.owner = row.OWNER;
    table.columns = [];
    table.constraints = [];
    return table;
  }

  public static processRows(resultset: any): Table[] | any {
    const tables: Table[] = [];
    let currentTable = new Table();
    for (let i = 0; i < resultset.length; i++) {
      const element = resultset[i];
      if (currentTable.name !== element.TABLE_NAME) {
        currentTable = TableMapper.toDomain(element);
        tables.push(currentTable);
      }
      const column = OracleColumnMapper.toDomain(element);
      column.table = currentTable; // Birdecional link
      currentTable.columns?.push(column);
    }
    return tables;
  }

  public static processConstraints(tables: Table[], rows: any): void {
    let constraint: Constraint = new Constraint();
    let column: Column | undefined;
    let rColumn: Column | undefined;
    let lastConstraintName: string = "";

    for (let i = 0; i < rows.length; i++) {
      const element = rows[i];
      const table = tables.find((table: Table) => table.name === element.TABLE_NAME);

      if (table) {
        switch (element.CONSTRAINT_TYPE) {
          case "R":
            if (!lastConstraintName || lastConstraintName !== element.CONSTRAINT_NAME) {
              lastConstraintName = element.CONSTRAINT_NAME;
              constraint = new Constraint();
              constraint.name = element.CONSTRAINT_NAME;
              constraint.type = element.CONSTRAINT_TYPE;
              constraint.table = table;
              constraint.referedTable = tables.find((table: Table) => table.name === element.R_TABLE_NAME);
              if (!constraint.referedTable) {
                console.warn("Refered table not found: " + element.R_TABLE_NAME);
              }
              table.constraints.push(constraint);
            }
            column = table.columns.find((column: Column) => column.name === element.COLUMN_NAME);
            rColumn = constraint.referedTable?.columns.find((column: Column) => column.name === element.R_COLUMN_NAME);
            if (!column || !rColumn) {
              console.log("Column not found: " + element.COLUMN_NAME + "on table" + element.TABLE_NAME);
              console.log("Constraint: " + element.CONSTRAINT_NAME + " refered Column:    " + element.R_COLUMN_NAME);
            }
            const pair: ColumnPair = new ColumnPair(column, rColumn);
            constraint.columnPairs.push(pair);
            break;
          case "U":
            column = table.columns.find((column: Column) => column.name === element.COLUMN_NAME);
            if (column) {
              column.unique = true;
            }
            break;
          case "U":
            column = table.columns.find((column: Column) => column.name === element.COLUMN_NAME);
            // && element.SEARCH_CONDITION?.toString().contains("IS NOT NULL"
            if (column) {
              column.checkValues = element.SEARCH_CONDITION; // FIXME: Check if this is correct
            }
          default:
            break;
        }
      }
    }
  }

  public static getInheritanceTable(table: Table): any {
    const pks = table.getPk();
    for (let i = 0; i < table.constraints.length; i++) {
      const contraint = table.constraints[i];
      const listOfColumnThatEqualsPk: Column[] = [];
      // for (def pair : contraint.columnPairs) {
      for (let j = 0; j < contraint.columnPairs.length; j++) {
        const pair = contraint.columnPairs[j];
        if (pair.referedColumn === null) {
          console.log(`contraint sem coluna referenciada ${pair.column.table}[${pair.column.name}]`);
        } else {
          const a = pks.find((pk) => pk.name === pair.column.name);
          const b = pair.referedColumn.table?.getPk().find((pk) => pk.name === pair.referedColumn.name);
          if (a && b) {
            listOfColumnThatEqualsPk.push(pair.column);
          }
        }
      }
      // se bate esta pk(s) eh constraint que aponta para tabela pai
      // compare two arrays
      if (pks.toString() === listOfColumnThatEqualsPk.toString()) {
        return contraint.referedTable;
      }
    }
    return null;
  }
}
