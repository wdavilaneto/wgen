import Table from "../model/relational/table";
import Column from "../model/relational/column";
import Entity from "@App/model/Entity";

function capitalize(str: string) {
  const words = str.split(/\s+/);
  for (let i = 0; i < words.length; ++i) {
    const word = words[i];
    words[i] = word.charAt(0).toUpperCase() + word.slice(1);
  }
  return words.join(" ");
}

function toCamelCase(str: string, isUpperCamelCase = false) {
  str = str.replace(/[-_\s.]+(.)?/g, (...args) => (args[1] ? args[1].toUpperCase() : ""));
  return (isUpperCamelCase ? str.substr(0, 1).toUpperCase() : str.substr(0, 1).toLowerCase()) + str.substr(1);
}

const toPascalCase = (input: string) => toCamelCase(input, true);

class PatternConverter {
  getEntityName(input: Table | string) {
    if (typeof input === "string") {
      return toPascalCase(input);
    }
    const name = this.getTableNameWithoutPrefix(input);
    return toPascalCase(name);
  }

  getPropertyName(column: Column | string) {
    if (typeof column === "string") {
      return toCamelCase(this.uncapitalize(column));
    }
    let name = this.getColumnNameWithoutPrefix(column);
    if (name.substring(0, 3) === "NM_") {
      name = name.replace("NM_", "NOME_"); // TODO language table  /preferences
    } else if (name.substring(0, 3) === "DS_") {
      name = name.replace("DS_", "DESCRICAO_"); // TODO language table  /preferences
    } else if (name.substring(0, 3) === "TP_") {
      name = name.replace("TP_", "TIPO_"); // TODO language table  /preferences
    }
    if (name.endsWith("_DK")) {
      name = name.replace("_DK", "_ID");
    }
    return toCamelCase(name.toLowerCase());
  }

  getComplexPropertyName(entity: Entity, propertyName: string, counter: number = 0): string {
    const name = propertyName + (counter == 0 ? "" : counter);
    if (!entity.containsPropertyName(name)) {
      return name;
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
    return name;
  }

  capitalize(input: string) {
    return capitalize(input);
  }

  uncapitalize(input: string) {
    return input.charAt(0).toLowerCase() + input.slice(1);
  }

  toCamelCase(input: string) {
    return toCamelCase(input);
  }

  toPascalCase(input: string) {
    return toPascalCase(input);
  }

  getTableNameWithoutPrefix(table: Table) {
    if (!table.name) throw new Error("Table name is undefined");
    const tableName = table.name?.toLowerCase().replace("^tb_", "");
    const prefix = table.getPrefix();
    if (prefix) {
      return tableName.replace(prefix.toLowerCase() + "_", "");
    }
    return tableName;
  }

  getColumnNameWithoutPrefix(column: Column) {
    if (!column.name) throw new Error("Column name is undefined");
    const prefix = column.getPrefix();
    let result = column.name;
    if (prefix) {
      result = column.name.replace(prefix + "_", "");
    }

    return result;
  }

  getTypeName(column: Column, language: string = "typescript") {
    if (language === "typescript") {
      return this.getTypeScriptTypeName(column);
    }
    return "any"; //PatternConverter.getJavaTypeName(column);
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
      BLOB: "Blob",
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

export default PatternConverter;
