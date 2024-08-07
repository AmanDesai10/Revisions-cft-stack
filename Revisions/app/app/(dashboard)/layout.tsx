import { ReactNode } from "react";
import Profile from "@/components/profile";
import Nav from "@/components/nav";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CreateOrganisationModal from "@/components/modal/create-organisation";


export default async function DashboardLayout({ children }: { children: ReactNode }) {
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

  if (!currentOrganisation) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CreateOrganisationModal />
      </div>
    );
  }
  return (
    <div>
      <Nav>
        <Profile />
      </Nav>
      <div className="min-h-screen dark:bg-black sm:pl-60">
        <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
          <div className="flex flex-col space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
