import { GetStaticProps, NextPage } from "next";

type Props = {
  title: string;
};

const About: NextPage<Props> = ({ title }) => {
  return <h1>Hello {title}</h1>;
};

export const getStaticProps: GetStaticProps<Props> = () => {
  return {
    props: {
      title: "Title",
    },
  };
};

export default About;
