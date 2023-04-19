import Table from "./relational/table";

class Project {
  constructor(
    public group: string,
    public name: string,
    public path: string,
    public description: string,
    public tables: Table[] = [] // List<Entity> entities = new ArrayList<Entity>(); // List<Clazz> classes = new ArrayList<Clazz>();
  ) // private StringUtil stringUtil = new StringUtil();
  // DatasourceInfo database
  // def pom
  // def metadata = [:]
  // def targetTables = [];
  // def config = [:];
  {}
}
