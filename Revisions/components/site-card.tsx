"use client";

import BlurImage from "@/components/blur-image";
import { placeholderBlurhash, random } from "@/lib/utils";
import { Organisation } from "@prisma/client";
import Link from "next/link";
import { useOrganisationStore } from "@/stores/organisation-store";
import { updateUser } from "@/lib/actions";
import { useUserStore } from "@/stores/user-store";

export default function SiteCard({ data }: { data: Organisation }) {
  const url = `${data.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  const setOrganisation = useOrganisationStore(
    (state) => state.setOrganisation,
  );
  const user = useUserStore((state) => state.currentUser);

  return (
    <div className="relative rounded-lg border border-stone-200 pb-10 shadow-md transition-all hover:shadow-xl dark:border-stone-700 dark:hover:border-white">
      <Link
        href={`/`}
        onClick={(e) => {
          if (user) {
            // set current organisation
            updateUser({
              ...user, currentOrganisationId: data.id,
            });
          }
          setOrganisation(data);
        }}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        <BlurImage
          alt={data.name ?? "Card thumbnail"}
          width={500}
          height={400}
          className="h-44 object-cover"
          src={data.image ?? "/placeholder.png"}
          placeholder="blur"
          blurDataURL={data.imageBlurhash ?? placeholderBlurhash}
        />
        <div className="border-t border-stone-200 p-4 dark:border-stone-700">
          <h3 className="my-0 truncate font-cal text-xl font-bold tracking-wide dark:text-white">
            {data.name}
          </h3>
          <p className="mt-2 line-clamp-1 text-sm font-normal leading-snug text-stone-500 dark:text-stone-400">
            {data.description}
          </p>
        </div>
      </Link>
      <div className="absolute bottom-4 flex w-full justify-between space-x-4 px-4">
        <a
          href={
            // process.env.NEXT_PUBLIC_VERCEL_ENV ?
            `https://${url}`
            // : `https://${data.subdomain}.localhost:3000`
          }
          target="_blank"
          rel="noreferrer"
          className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          {url} ↗
        </a>
      </div>
    </div>
  );
}
