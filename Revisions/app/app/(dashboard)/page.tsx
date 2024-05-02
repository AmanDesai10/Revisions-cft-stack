import CreatePostButton from "@/components/create-post-button";
import Posts from "@/components/posts";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import AppInitializer from "./app-initializer";
import Image from "next/image";
import { useEffect } from "react";

export default async function Overview() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // get current user's organisations
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      organisations: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const currentOrganisation =
    user?.organisations.find((org) => org.id === user.currentOrganisationId) ||
    user?.organisations[0];

  // useEffect(() => {
  // console.log('currentOrganisation', currentOrganisation);
  // }, [currentOrganisation]);

  if (!currentOrganisation) {
    return (
      <div className="mt-20 flex flex-col items-center space-x-4">
        <h1 className="font-cal text-4xl">No Sites Yet</h1>
        <Image
          alt="missing site"
          src="https://illustrations.popsy.co/gray/web-design.svg"
          width={400}
          height={400}
        />
        <p className="text-lg text-stone-500">
          You do not have any organisations yet. Create one to create posts.
        </p>
      </div>
    );
  }

  const url = `${currentOrganisation.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <AppInitializer user={user} currentOrganisation={currentOrganisation}>
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <h1 className="w-60 truncate font-cal text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
            All Posts for {currentOrganisation.name}
          </h1>
          <a
            href={
              // process.env.NEXT_PUBLIC_VERCEL_ENV?
              `http://${url}`
              // : `http://${currentOrganisation.subdomain}.localhost:3000`
            }
            target="_blank"
            rel="noreferrer"
            className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
          >
            {url} ↗
          </a>
        </div>
        <CreatePostButton />
      </div>
      <Posts organisationId={decodeURIComponent(currentOrganisation.id)} />
    </AppInitializer>
  );
}
