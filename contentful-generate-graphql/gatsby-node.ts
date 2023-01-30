import type { GatsbyNode } from 'gatsby';
import { getGraphqlTypes } from './get-graphql-types';

const onPreInit: GatsbyNode['onPreInit'] = async () => {
  console.log('Loading custom plugin');
};

const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] =
  async ({ actions, schema }) => {
    const { createTypes } = actions;

    const typeDef = `
         type ContentfulRichText {
      raw: String
      references: [Node] @link(from: "references___NODE")
    }
`;
    createTypes(typeDef);
    createTypes(await getGraphqlTypes(schema, createTypes));
  };

export { onPreInit, createSchemaCustomization };
