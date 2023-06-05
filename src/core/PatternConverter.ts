import Table from "../model/relational/table";
import Column from "../model/relational/column";
import Entity from "@App/model/Entity";
import StringReplacer from "./util/string-replacer";
import { toPascalCase, toCamelCase, toSnakeCase } from "./util/string-transform";

export class PatternConverter {
  private replacer: StringReplacer;
  constructor() {
    this.replacer = new StringReplacer();
  }

  getEntityName(input: Table | string) {
    if (typeof input === "string") {
      return toPascalCase(input);
    }
    const name = this.getTableNameWithoutPrefix(input);
    return this.replacer.replace(toPascalCase(name));
  }

  getPropertyName(column: Column | string) {
    let result = "fixme";
    if (typeof column === "string") {
      result = this.replacer.replace(toCamelCase(column));
    } else {
      const cleanedColumnName = this.getColumnNameWithoutPrefix(column);
      result = this.replacer.replace(toCamelCase(cleanedColumnName));
    }
    return result.charAt(0).toLowerCase() + result.slice(1);
  }

  getComplexPropertyName(entity: Entity, propertyName: string, counter: number = 0): string {
    const name = propertyName + (counter == 0 ? "" : counter);
    if (!entity.containsPropertyName(name)) {
      return this.getPropertyName(name + entity.name);
    } else {
      return this.getComplexPropertyName(entity, propertyName, counter + 1);
    }
  }

  columnToPropertyName(column: Column) {
    // const columnReturn = removeUnusedParts(column)
    let name = column.name.replace(column.table.name, "");
    name = this.getPropertyName(name.length > 0 ? name : column.name);
    if (column.table.entity != null) {
      let beanName = name.replace(column.table.entity.name, "");
      if (beanName != null && beanName !== "") {
        name = beanName;
      }
    }
    if (name === "") {
      name = name.replace("ss", "zz");
    }
    return this.replacer.replace(name);
  }

  toCamelCase(input: string, isUpperCamelCase = false) {
    return toCamelCase(input, isUpperCamelCase);
  }

  toPascalCase(input: string) {
    return toPascalCase(input);
  }

  toSnakeCase(input: string, separator: string = "-") {
    return toSnakeCase(input, separator);
  }

  getTableNameWithoutPrefix(table: Table) {
    if (!table.name) throw new Error("Table name is undefined");
    const tableName = table.name.toUpperCase().replace("^tb_", "");
    const prefix = table.getPrefix();
    if (prefix && prefix !== "") {
      return tableName.replace(prefix + "_", "");
    }
    return tableName;
  }

  getColumnNameWithoutPrefix(column: Column) {
    if (!column.name) throw new Error("Column name is undefined");
    let result = column.name;
    const prefix = column.getPrefix();
    if (prefix && prefix !== "") {
      result = result.replace(prefix + "_", "");
    }
    return this.replacer.replace(result);
  }

  getTypeName(column: Column, language: string = "typescript") {
    if (language === "typescript") {
      return this.getTypeScriptTypeName(column);
    }
    return "any";
  }

  getTypeScriptTypeName(column: Column): string {
    if (!column.type || column.type === "") return "any";
    const db2Ts = {
      DATE: "Date",
      TIMESTAMP: "Date",
      "TIMESTAMP(6)": "Date",
      "TIMESTAMP(6) WITH LOCAL TIME ZONE": "Date",
      CHAR: "string",
      NUMBER: "number",
      LONG: "number",
      INTEGER: "number",
      VARCHAR2: "string",
      TEXT: "string",
      CHARACTER: "string",
      "CHARACTER VARYING": "string",
      NVARCHAR2: "string",
      VARCHAR: "string",
      CLOB: "string",
      BLOB: "string",
      RAW: "AnyObject",
      "LONG RAW": "number",
      NCHAR: "string",
      XMLTYPE: "string",
      "SDO GEOMETRY": "string",
      "INTERVAL YEAR(2) TO MONTH": "string",
      BIGINT: "number",
      OID: "number",
      BOOLEAN: "boolean",
      DOUBLE: "number",
      FLOAT: "number",
      "DOUBLE PRECISION": "number",
      BYTEA: "any[]",
      "TIMESTAMP WITHOUT TIME ZONE": "Date",
      SMALLINT: "number",
      '"CHAR"': "string",
    } as { [key: string]: string };
    return db2Ts[column.type.toUpperCase()] || "any";
  }
}

const patternConverter = new PatternConverter();

export default patternConverter;
