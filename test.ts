import { createClient } from 'contentful';
import _ from 'lodash';
import { ContentfulDataTypes } from './datatypes';

const makeTypeName = (type, typePrefix = `Contentful`) =>
  _.upperFirst(_.camelCase(`${typePrefix} ${type}`));

const unionsNameSet = new Set();

const getLinkFieldType = (linkType, field, schema, createTypes) => {
  // Check for validations
  const validations =
    field.type === `Array` ? field.items?.validations : field?.validations;

  if (validations) {
    // We only handle content type validations
    const linkContentTypeValidation = validations.find(
      ({ linkContentType }) => !!linkContentType
    );
    if (linkContentTypeValidation) {
      const { linkContentType } = linkContentTypeValidation;
      const contentTypes = Array.isArray(linkContentType)
        ? linkContentType
        : [linkContentType];

      // Full type names for union members, shorter variant for the union type name
      const translatedTypeNames = contentTypes.map((typeName) =>
        makeTypeName(typeName)
      );
      const shortTypeNames = contentTypes.map((typeName) =>
        makeTypeName(typeName, ``)
      );

      // Single content type
      if (translatedTypeNames.length === 1) {
        return {
          type: translatedTypeNames.shift(),
          extensions: {
            link: { by: `id`, from: field.id + '___NODE' },
          },
        };
      }

      // Multiple content types
      const unionName = [`UnionContentful`, ...shortTypeNames].join(``);

      if (!unionsNameSet.has(unionName)) {
        unionsNameSet.add(unionName);
        createTypes(
          schema.buildUnionType({
            name: unionName,
            types: translatedTypeNames,
          })
        );
      }
      return {
        type: unionName,
        extensions: {
          link: { by: `id`, from: field.id + '___NODE' },
        },
      };
    }
  }

  return {
    type: `Contentful${linkType}`,
    extensions: {
      link: { by: `id`, from: field.id + '___NODE' },
    },
  };
};

// Translate Contentful field types to GraphQL field types
const translateFieldType = (field, schema, createTypes) => {
  let fieldType;
  if (field.type === `Array`) {
    // Arrays of Contentful Links or primitive types
    const fieldData =
      field.items.type === `Link`
        ? getLinkFieldType(field.items.linkType, field, schema, createTypes)
        : translateFieldType(field.items);

    fieldType = { ...fieldData, type: `[${fieldData.type}]` };
  } else if (field.type === `Link`) {
    // Contentful Link (reference) field types
    fieldType = getLinkFieldType(field.linkType, field);
  } else {
    // Primitive field types
    fieldType = ContentfulDataTypes.get(field.type)(field);
  }

  // @todo what do we do when preview is enabled? Emptry required fields are valid for Contentfuls CP-API
  // if (field.required) {
  //   fieldType.type = `${fieldType.type}!`
  // }

  return fieldType;
};

const testigen = (contentTypes, schema, createTypes) => {
  const contentfulTypes = [];

  contentTypes.forEach((contentTypeItem) => {
    const fields: { [key: string]: { type: string } } = {};

    contentTypeItem.fields.forEach((field) => {
      if (field.disabled || field.omitted) {
        return;
      }
      if ([`id`, `sys`, `contentfulMetadata`].includes(field.id)) {
        // Throw error on reserved field names as the Contenful GraphQL API does:
        // https://www.contentful.com/developers/docs/references/graphql/#/reference/schema-generation/fields
        throw new Error(
          `Unfortunately the field name ${field.id} is reserved. ${contentTypeItem.name}@${contentTypeItem.sys.id}`
        );
      }
      fields[field.id] = fields[field.id] = translateFieldType(
        field,
        schema,
        createTypes
      );
    });

    contentfulTypes.push(
      schema.buildObjectType({
        name: _.upperFirst(_.camelCase(`Contentful${contentTypeItem.name}`)),
        fields,
        interfaces: [`ContentfulReference`, `ContentfulEntry`, `Node`],
      })
    );
  });

  return contentfulTypes;
};

//ENtry
export const test = async (schema, cache, createTypes) => {
  const sourceId = `${process.env.CONTENTFUL_SPACE_ID}-${process.env.CONTENTFUL_ENVIRONMENT}`;
  const contentTypeItems = await cache.get(
    `contentful-content-types-${sourceId}`
  );

  if (contentTypeItems) {
    return testigen(contentTypeItems, schema, createTypes);
  } else {
    const client = createClient({
      space: process.env.CONTENTFUL_SPACE_ID || '',
      accessToken: process.env.CONTENTFUL_CDA_TOKEN || '',
    });
    const t = await client.getContentTypes({ order: `sys.createdAt` });
    //console.log(2, JSON.stringify(t.items));
    //console.log(3, JSON.stringify(testigen(t.items, schema, createTypes)));

    return testigen(t.items, schema, createTypes);
  }
};
