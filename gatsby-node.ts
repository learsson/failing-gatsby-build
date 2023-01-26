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

export {createPages}
