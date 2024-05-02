import { Post } from "@prisma/client";
// import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import { MDXRemote } from "next-mdx-remote/rsc";
import { replaceLinks } from "@/lib/remark-plugins";
import { Tweet } from "react-tweet";
import BlurImage from "@/components/blur-image";
import styles from "./mdx.module.css";
import { Suspense } from "react";
import remarkGfm from "remark-gfm";

export default function MDX({ content, className }: { content: string, className?: string }) {
  const components = {
    a: replaceLinks,
    BlurImage,
    Tweet,
  };

  return (
    <article
      className={`prose-md prose prose-stone dark:prose-invert sm:prose-lg sm:w-3/4 ${styles.root} ${className}`}
    >
      <Suspense fallback={<>Loading...</>}>
        <MDXRemote
          source={content}
          /* @ts-ignore */
          components={components}
          options={{
            parseFrontmatter: true,
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              format: "mdx",
            },
          }}
        />
      </Suspense>
    </article>
  );
}