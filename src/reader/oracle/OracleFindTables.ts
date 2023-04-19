import oracledb from "oracledb";
import { oracleConfig } from "../../config";
import Table from "../../model/relational/table";
import MybatisMapper, { Format, Params } from "mybatis-mapper";
import { TableMapper } from "./oracle-model-mapper";

export default async function findTables(owner: string): Promise<any> {
  let connection;
  try {
    connection = await oracledb.getConnection(oracleConfig);
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

    // create the myBatisMapper from xml file
    MybatisMapper.createMapper(["assets/oracle-table-mapper.xml"]);

    // Get SQL Statement
    const format: Format = { language: "sql", indent: "  " };
    const params: Params = { owner: owner };
    var query = MybatisMapper.getStatement("oracle-table-mapper", "findTableAndColumns", params, format);
    const result = await connection.execute(query);

    // First Rows Process
    const tables = TableMapper.processRows(result.rows) as Table[];

    const tablenames = tables.map((table: Table) => table.name);
    const constraints = MybatisMapper.getStatement(
      "oracle-table-mapper",
      "findConstraints",
      { tablenames: tablenames, owner: owner },
      format
    );
    const resultConstraints = await connection.execute(constraints);
    TableMapper.processConstraints(tables, resultConstraints.rows);
    for (const table of tables) {
      table.inheritanceTable = TableMapper.getInheritanceTable(table);
    }
    return tables;
  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
