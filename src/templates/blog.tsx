import { graphql, PageProps } from "gatsby";
import React from "react";

interface BlogProps {
    contentfulBlogPost: {title: string}
}
const Blog = ({data}: PageProps<BlogProps>) => {

console.log(data)
return <h1>{data.contentfulBlogPost.title}</h1>}

export default Blog

export const query = graphql`
    query BlogQuery($id: String!) {
        contentfulBlogPost(id: {eq: $id}) {
            title
            theDoggos {
                name
            }
        }
    }
`
