import Entity from "../model/Entity";
import Table from "../model/relational/table";
import PatternConverter from "../core/PatternConverter";
import RelationshipProperty from "../model/RelationshipProperty";
import { Constraint } from "@App/model/relational/constraint";
import ComplexProperty from "@App/model/ComplexProperty";

export default class TableEntityMapper {
  private patternConverter: PatternConverter = new PatternConverter();

  private toEntityWithSimpleProperties(table: Table): Entity {
    const entity = new Entity();
    entity.table = table;
    entity.table.entity = entity; // set circular reference
    entity.name = this.patternConverter.getEntityName(table);
    // entity.table.entity = entity;
    // entity.id = table.columns.find((column) => column.isKey());
    table.columns.forEach((column) => {
      // make sure the column is not a key or key part
      if (!column.isKey()) {
        const property: RelationshipProperty = new RelationshipProperty();
        property.column = column;
        property.entity = entity;
        property.name = this.patternConverter.getPropertyName(column);
        if (column.isKey() && table.getPk().length === 1) {
          entity.id = property;
        } else {
          entity.properties.push(property);
        }
      }
    });
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
            delete entity.properties[propertyIndex];
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
    complexProperty.name = this.patternConverter.getComplexPropertyName(otherEntity, complexProperty.name) + "List";
    thisEntity.complexProperties.push(complexProperty);
    complexProperty.nmTable = table;

    const referedProperty = new ComplexProperty(thisEntity, table.constraints[1]);
    referedProperty.name = this.patternConverter.getComplexPropertyName(thisEntity, referedProperty.name) + "List";
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
        const complexProperty: ComplexProperty = new ComplexProperty(entity);
        complexProperty.constraint = constraint;
        complexProperty.referedEntity = constraint.referedTable.entity;
        if (complexProperty.referedEntity == null) {
          console.error("Refered Entity is null", constraint.referedTable.name);
        }

        if (constraint.isSingleColumn()) {
          const thisPrefix = constraint.getSingleColumnPair().column.getPrefix();
          const otherKeyName = constraint.getSingleColumnPair().referedColumn.name;
          let fieldBasedOnFKColumnName = constraint
            .getSingleColumnPair()
            .column.name.replace(thisPrefix + "_", "")
            .replace(otherKeyName, "");
          //println "${constraint.singleColumnPair.coluna.name} - ${otherKeyName} = $fieldBasedOnFKColumnName "
          if (fieldBasedOnFKColumnName.length > 4) {
            const columnName = this.patternConverter.columnToPropertyName(constraint.getSingleColumnPair().column);
            fieldBasedOnFKColumnName = this.patternConverter.getComplexPropertyName(entity, columnName);
            if (fieldBasedOnFKColumnName.length > 4) {
              complexProperty.name = fieldBasedOnFKColumnName;
            } else {
              complexProperty.name = this.patternConverter.getComplexPropertyName(entity, complexProperty.name);
            }
          } else {
            // such a short field name .. lets try somthing diferent
            complexProperty.name = this.patternConverter.getComplexPropertyName(entity, complexProperty.name);
          }
        } else {
          complexProperty.name = this.patternConverter.getComplexPropertyName(entity, complexProperty.name);
        }

        entity.complexProperties.push(complexProperty);

        // ToMany Property create
        const referedProperty = new ComplexProperty(entity);
        referedProperty.name = this.patternConverter.getComplexPropertyName(
          complexProperty.referedEntity,
          referedProperty.name
        );
        referedProperty.mappedBy = complexProperty.name;
        complexProperty.referedEntity.complexProperties.push(referedProperty);

        for (const columnPair of constraint.columnPairs) {
          const index = entity.properties.findIndex((p) => p.column.name === columnPair.column.name);
          delete entity.properties[index];
        }
        if (entity.containsPropertyName(complexProperty.name)) {
          complexProperty.name += "Entity";
        }
        return { complexProperty: complexProperty, referedProperty: referedProperty };
      }
      return null;
    }
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
    const entities: Entity[] = nonNMTables.map((table) => this.toEntityWithSimpleProperties(table));
    this.processInheritance(entities);
    this.proccessComplexProperties(entities);
    return entities;
  }
}
