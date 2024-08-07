import { Post } from "@prisma/client";
import styles from "./article.module.css";
import { placeholderBlurhash, toDateString } from "@/lib/utils";
import BlurImage from "./blur-image";
import MDX from "./mdx";

export default function Article({
  content,
  data,
  index,
}: {
  content: Post;
  data: any;
  index: number;
}) {
  return (
    <article className={"md:flex"}>
      <h2 className={styles["content-date"] + " mt-px h-full dark:text-white"}>
        <a href="#2022-06-23">{toDateString(content.createdAt)}</a>
      </h2>
      <div className={styles["content-block"]}>
        <div className={styles["feed-border"]}></div>
        <div className={styles["feed-dot"]}></div>
        {/* <Badge label={`v${content.title?.substring(content.title.length - 1)}`} /> */}
        <Badge label={`v${index}`} />
        {content.title && (
          <h1 className="mb-4 text-xl font-bold dark:text-white sm:text-3xl">
            {content.title}
          </h1>
        )}
        <div className="relative mb-10 w-full max-w-screen-lg overflow-hidden  md:rounded-2xl">
          <BlurImage
            alt={data.title ?? "Post image"}
            width={1200}
            height={630}
            className="h-full w-full object-cover"
            placeholder="blur"
            blurDataURL={data.imageBlurhash ?? placeholderBlurhash}
            src={data.image ?? "/placeholder.png"}
          />
        </div>

        {content.content && <MDX content={content.content} />}

        <div className="flex w-full items-center justify-start space-x-4">
          <div className="relative h-8 w-8 flex-none overflow-hidden rounded-full">
            {data.user?.image ? (
              <BlurImage
                alt={data.user?.name ?? "User Avatar"}
                width={100}
                height={100}
                className="h-full w-full object-cover"
                src={data.user?.image}
              />
            ) : (
              <div className="absolute flex h-full w-full select-none items-center justify-center bg-stone-100 text-4xl text-stone-500">
                ?
              </div>
            )}
          </div>
          <p className="ml-3 inline-block whitespace-nowrap align-middle text-sm font-semibold dark:text-white md:text-base">
            {data.user?.name}
          </p>
        </div>
      </div>
    </article>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <div className="absolute -top-6 right-0 mb-4 md:static">
      <span className="inline-flex items-center rounded-md border border-sky-200 bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800">
        <svg
          className="-ml-0.5 mr-1.5 h-2 w-2 text-sky-400"
          fill="currentColor"
          viewBox="0 0 8 8"
        >
          <circle cx="4" cy="4" r="3" />
        </svg>
        {label}
      </span>
    </div>
  );
}
