import { graphql, PageProps } from 'gatsby';
import {
  GatsbyImage,
  IGatsbyImageData,
  getImageData,
} from 'gatsby-plugin-image';
import React from 'react';

interface BlogProps {
  contentfulBlogPost: {
    title: string;
    body: { raw: string };
    theDoggos: {
      name: string;
      numberOfLegs: number;
      headshot: { gatsbyImageData: IGatsbyImageData };
    }[];
    multi: any;
  };
}
const Blog = ({ data }: PageProps<BlogProps>) => {
  console.log(JSON.stringify(data.contentfulBlogPost.multi));
  return (
    <>
      <h1>{data.contentfulBlogPost.title}</h1>
      <div>{data.contentfulBlogPost.body.raw}</div>
      <h2>Doggos</h2>
      {data.contentfulBlogPost.theDoggos.map((doggo, index) => (
        <div key={`dog-${index}`} style={{ paddingBottom: '40px' }}>
          <div>{`${doggo.name} - ${doggo.numberOfLegs} number of legs`}</div>
          <GatsbyImage
            alt={`${doggo.name} - ${doggo.numberOfLegs} number of legs`}
            image={doggo.headshot.gatsbyImageData}
          />
        </div>
      ))}
    </>
  );
};

export default Blog;

export const query = graphql`
  query BlogQuery($id: String!) {
    contentfulBlogPost(id: { eq: $id }) {
      title
      category
      body {
        raw
      }
      theDoggos {
        name
        numberOfLegs
        headshot {
          gatsbyImageData(width: 600)
        }
      }
      multi {
        ... on ContentfulEmpty {
          title
        }

        ... on ContentfulDog {
          name
        }
      }
    }
  }
`;
