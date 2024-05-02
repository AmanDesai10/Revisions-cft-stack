"use client";
import { useOrganisationStore } from "@/stores/organisation-store";
import { useUserStore } from "@/stores/user-store";
import { Organisation, User } from "@prisma/client";

export default function AppInitializer({
  user,
  currentOrganisation,
  children,
}: {
  user: User;
  currentOrganisation: Organisation | null;
  children: React.ReactNode;
}) {
  const setOrganisation = useOrganisationStore(
    (state) => state.setOrganisation,
  );
  const setUser = useUserStore((state) => state.setUser);
  setUser(user);
  if (currentOrganisation) {
    setOrganisation(currentOrganisation);
  }
  return children;
}
