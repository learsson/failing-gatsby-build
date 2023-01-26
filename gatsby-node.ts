import path from 'path';
import type { GatsbyNode } from 'gatsby';

const createPages: GatsbyNode['createPages'] = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const queryString = `
    query {
      allContentfulBlogPost {
        nodes {
          id
          slug
        }
      }
    }
    `;
  const blogs: {
    errors?: any;
    data?: { allContentfulBlogPost:{nodes: { id: string; slug: string }[] }};
  } = await graphql(queryString);

  if (!blogs.errors && blogs.data) {
    for (const blog of blogs.data.allContentfulBlogPost.nodes) {
      createPage({
        path: blog.slug,
        component: path.resolve('./src/templates/blog.tsx'),
        context: {
          id: blog.id,
        },
      });
    }
  }
};

const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = ({ actions }) => {
  const { createTypes } = actions;

  //Create manual type definition in order to get Gatsby to build
  const typeDefs = `
      type ContentfulBlogPost {
        theDoggos: [ContentfulDog]
      }
      type ContentfulDog {
          name: String
      }
  `;

  createTypes(typeDefs);
};

export {createPages, createSchemaCustomization}
