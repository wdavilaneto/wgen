import RelationshipProperty from "./RelationshipProperty";
import Table from "./relational/table";

export class Clazz {
  name?: string;
  inheritedClass?: string;
  type?: string;
  extension?: string;
}

export default class Entity extends Clazz {
  table?: Table;
  entity?: Entity;
  parent?: Entity;
  childrens?: Entity[];

  embeddedId?: Entity;
  embeddedFor?: Entity;

  id: any = undefined;

  properties: RelationshipProperty[] = [];
  complexProperties: any[] = [];
  enums: any[] = [];

  isEmbedded(): boolean {
    return this.embeddedId != null;
  }
  isEmbeddable(): Boolean {
    return this.embeddedFor != null;
  }
  getTable(): Table | undefined {
    return this.isEmbedded() ? this.embeddedFor?.table : this.table;
  }
  getId(): any {
    return this.embeddedId ? this.embeddedId : this.parent ? this.parent.getId() : this.id;
  }
  getOneToManyProperties(): any[] {
    return this.properties.filter((property: any) => property.isOneToMany());
  }
  getManyToOneProperties(): any[] {
    return this.properties.filter((property: any) => property.isManyToOne());
  }
  getManyToManyProperties(): any[] {
    return this.properties.filter((property: any) => property.isManyToMany());
  }
  containsPropertyName(name: string): boolean {
    return this.properties.some((property: any) => property.name === name);
  }
}
