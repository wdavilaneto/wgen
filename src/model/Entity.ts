import patternConverter from "@App/core/PatternConverter";
import ComplexProperty from "./ComplexProperty";
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
  getOneToManyProperties(): ComplexProperty[] {
    return this.complexProperties.filter((property: ComplexProperty) => property.isOneToMany());
  }
  getManyToOneProperties(): ComplexProperty[] {
    return this.complexProperties.filter((property: ComplexProperty) => property.isManyToOne());
  }
  getManyToManyProperties(): ComplexProperty[] {
    return this.complexProperties.filter((property: ComplexProperty) => property.isManyToMany());
  }
  containsPropertyName(name: string): boolean {
    return (
      this.properties.some((property: any) => property.name === name) ||
      this.complexProperties.some((property: any) => property.name === name)
    );
  }
  getDistinctedAllComplexProperties(): any[] {
    // creaite a dictionary to avoid duplicate properties
    const map = new Map();
    const returnList = [];
    for (const property of this.complexProperties) {
      if (!map[property.referedEntity.name]) {
        map[property.referedEntity.name] = property.name;
        returnList.push(property);
      }
    }
    if (this.parent) {
      for (const property of this.parent.complexProperties) {
        if (!map[property.referedEntity.name]) {
          map[property.referedEntity.name] = property.name;
          returnList.push(property);
        }
      }
    }
    return returnList;
  }
  getSnakeCaseName(): string {
    return patternConverter.toSnakeCase(this.name);
  }
  getCamelCaseName(): string {
    return patternConverter.toCamelCase(this.name);
  }
  getBeanPattern(): string {
    return this.name.charAt(0).toLowerCase() + this.name.slice(1);
  }
}
