import Table from "@App/model/relational/table";
import findTables from "./OracleFindTables";

// interface IRelationalDatabaseLoader {
//   findTables(owner: string): Promise<Table[] | null>;
// }

class OracleRetriever {
  async findTables(owner: string): Promise<Table[]> {
    const result = await findTables(owner);
    return result;
  }
}

export default OracleRetriever;
