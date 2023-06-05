import ComplexProperty from "@App/model/ComplexProperty";
import { ColumnPair, Constraint } from "@App/model/relational/constraint";
import patternConverter from "../core/PatternConverter";
import Entity from "../model/Entity";
import RelationshipProperty from "../model/RelationshipProperty";
import Table from "../model/relational/table";

export default class TableEntityMapper {
  constructor() {}

  private createEntity(table: Table): Entity {
    const entity = new Entity();
    entity.table = table;
    entity.table.entity = entity; // set circular reference
    entity.name = patternConverter.getEntityName(table);
    // entity.table.entity = entity;
    // entity.id = table.columns.find((column) => column.isKey());
    // table.columns.forEach((column) => {
    for (const column of table.columns) {
      // make sure the column is not a key or key part
      if (!column.isKey()) {
        const property: RelationshipProperty = new RelationshipProperty(column, entity);
        property.name = patternConverter.getPropertyName(column);
        if (column.isKey() && table.getPk().length === 1) {
          entity.id = property;
        } else {
          entity.properties.push(property);
        }
      }
    }
    if (table.inheritanceTable === null) {
      if (table.getPk() == null || table.getPk().length === 0) {
        console.error("Table " + table.name + " has no primary key");
      } else if (table.getPk().length > 1) {
        console.error("Table " + table.name + " has composite primary key");
        //TODO: implement composite key (aka "Embedded" entity as id)
        for (const column of table.getPk()) {
          // A principio Cada coluna eh uma propriedade simples..
          const propertyIndex = entity.properties.findIndex((p) => p.column.name === column.name);
          if (propertyIndex > -1) {
            // remove ja que a propriedade sera migrada para entity pk ..
            entity.properties.splice(propertyIndex, 1);
          } else {
            console.error(
              "Table " + table.name + " has composite primary key but column " + column.name + " is not a property"
            );
          }
        }
        // entityList.add(entityPk)
      }
    }
    return entity;
  }

  private isInheritenceConstraint(constraint: Constraint, table: Table) {
    return table.inheritanceTable && constraint.referedTable.name === table.inheritanceTable.name;
  }

  private processInheritance(entities: Entity[]) {
    for (const entity of entities) {
      if (entity.table.inheritanceTable != null && !entity.isEmbeddable()) {
        if (entity.table.inheritanceTable.entity.isEmbeddable()) {
          entity.parent = entity.table.inheritanceTable.entity.embeddedFor;
          entity.table.inheritanceTable.entity.embeddedFor.childrens.push(entity);
        } else {
          entity.parent = entity.table.inheritanceTable.entity;
          entity.table.inheritanceTable.entity.childrens.push(entity);
        }
      }
    }
  }
  private createNmComplexProperty(table: Table) {
    const thisEntity = table.constraints[0].referedTable.entity;
    const otherEntity = table.constraints[1].referedTable.entity;

    const complexProperty = new ComplexProperty(otherEntity, table.constraints[0]);
    complexProperty.name = patternConverter.getComplexPropertyName(otherEntity, complexProperty.name) + "List";
    thisEntity.complexProperties.push(complexProperty);
    complexProperty.nmTable = table;

    const referedProperty = new ComplexProperty(thisEntity, table.constraints[1]);
    referedProperty.name = patternConverter.getComplexPropertyName(thisEntity, referedProperty.name) + "List";
    otherEntity.complexProperties.push(referedProperty);
    referedProperty.nmTable = table;

    table.entity = null;
    return { complexProperty: complexProperty, referedProperty: referedProperty };
  }

  private createComplexProperty(entity: Entity, constraint: Constraint) {
    if (constraint.referedTable) {
      const pk = entity.table.getPk();
      const conaintsAllKeys = pk.some((pk) =>
        constraint.getThisSideColumns().some((column) => column.name === pk.name)
      );
      // Se o cara NAO for um entityID OU for um campo que eh parte da CHAVE do EntityID .. processa a chave composta
      if (!entity.isEmbeddable() || (entity.isEmbeddable() && conaintsAllKeys)) {
        // ToOne Complex property
        const complexProperty: ComplexProperty = new ComplexProperty(entity, constraint);
        complexProperty.constraint = constraint;
        complexProperty.referedEntity = constraint.referedTable.entity;
        if (complexProperty.referedEntity == null) {
          console.error("Refered Entity is null", constraint.referedTable.name);
        }
        const column = constraint.getThisSideColumns().pop();
        complexProperty.name = patternConverter.getPropertyName(column);
        complexProperty.name += complexProperty.referedEntity.name;
        // Realize  other side ToMany Relationship
        const referedProperty = this.processOtherSideComplexProperties(entity, complexProperty);
        complexProperty.mappedBy = referedProperty.name;
        entity.complexProperties.push(complexProperty);
      }
    }
  }
  private processOtherSideComplexProperties(entity: Entity, complexProperty: ComplexProperty) {
    const constraint = complexProperty.constraint;
    const otherEntiy = complexProperty.referedEntity;
    // for ToMany property we dont need the constraint on entity ..
    const referedProperty = new ComplexProperty(entity);
    const column = constraint.getThisSideColumns().pop();
    const name = patternConverter.getPropertyName(column);
    referedProperty.name = this.getPropertyName(otherEntiy, name) + entity.name + "List";
    referedProperty.mappedBy = complexProperty.name;
    for (const columnPair of constraint.columnPairs) {
      const index = entity.properties.findIndex((p: RelationshipProperty) => p.column.name === columnPair.column.name);
      entity.properties.splice(index, 1);
    }
    complexProperty.referedEntity.complexProperties.push(referedProperty);
    return referedProperty;
  }

  private proccessComplexProperties(entities: Entity[]) {
    for (const entity of entities) {
      // Loop para adicionar propiedades complexas
      for (const constraint of entity.table.constraints) {
        // Caso nao seja a contraint da Heranca adicionar propriedade complexa
        if (!this.isInheritenceConstraint(constraint, entity.table)) {
          this.createComplexProperty(entity, constraint);
        }
      }
    }
  }

  generateModel(tables: Table[]) {
    const nonNMTables: Table[] = tables.filter((table: Table) => !table.isNmRelationShip());
    const entities: Entity[] = nonNMTables.map((table) => this.createEntity(table));
    this.processInheritance(entities);
    this.proccessComplexProperties(entities);
    for (const table of tables.filter((table: Table) => table.isNmRelationShip())) {
      //this.createNmComplexProperty(table);
      console.log("NM Table", table.name);
    }
    // processEmbadableEntityes(entityList)
    // generateEnums(entityList)
    return entities;
  }

  private getPropertyName(entity: Entity, propertyName: string, counter = 0) {
    const name = propertyName + (!counter ? "" : counter);
    if (!entity.containsPropertyName(name)) {
      return name;
    } else {
      return this.getPropertyName(entity, propertyName, counter + 1);
    }
  }
}
