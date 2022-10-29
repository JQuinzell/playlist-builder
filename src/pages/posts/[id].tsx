import { GetStaticPaths, GetStaticProps, NextPage } from "next";

type Props = {
  id: string;
};

const Post: NextPage<Props> = ({ id }) => {
  return <p>Post {id}</p>;
};

export const getStaticPaths: GetStaticPaths<Props> = async () => {
  const posts = [{ id: 1 }, { id: 2 }, { id: 3 }];
  // Get the paths we want to pre-render based on posts
  const paths = posts.map((post) => ({
    params: { id: post.id.toString() },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  console.log(params);
  return { props: { id: "1" } };
};

export default Post;
