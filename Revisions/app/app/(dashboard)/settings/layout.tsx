import { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import SiteSettingsNav from "./nav";

export default async function SiteAnalyticsLayout({
  children,
}: {
  children: ReactNode;
}) {
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

  const currentOrganisation =
    user?.organisations.find((org) => org.id === user.currentOrganisationId) ||
    user?.organisations[0];
  if (!currentOrganisation) {
    notFound();
  }

  const url = `${currentOrganisation.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <>
      <div className="flex flex-col items-center space-x-4 space-y-2 sm:flex-row sm:space-y-0">
        <h1 className="font-cal text-xl font-bold dark:text-white sm:text-3xl">
          Settings for {currentOrganisation.name}
        </h1>
        <a
          href={
            // process.env.NEXT_PUBLIC_VERCEL_ENV ?
            `https://${url}`
            // : `https://${currentOrganisation.subdomain}.localhost:3000`
          }
          target="_blank"
          rel="noreferrer"
          className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          {url} ↗
        </a>
      </div>
      <SiteSettingsNav />
      {children}
    </>
  );
}
