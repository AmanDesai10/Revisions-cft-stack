import { headers } from "next/headers";
import { getPostsFeed } from "@/lib/fetchers";

export default async function Sitemap() {
  const headersList = headers();
  const domain =
    headersList
      .get("host")
      ?.replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) ??
    "revisions.tech";

  const posts = await getPostsFeed(domain);

  return [
    {
      url: `https://${domain}`,
      lastModified: new Date(),
    },
    ...posts.map(({ slug }) => ({
      url: `https://${domain}/${slug}`,
      lastModified: new Date(),
    })),
  ];
}
