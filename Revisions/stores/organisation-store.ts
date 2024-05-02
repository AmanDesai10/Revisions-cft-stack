import { Organisation } from "@prisma/client";
import { create } from "zustand";

interface OrganisationState {
  currentOrganisation: Organisation | null;
}

interface OrganisationActions {
  setOrganisation: (organisation: Organisation) => void;
}

export const useOrganisationStore = create<
  OrganisationState & OrganisationActions
>((set) => ({
  currentOrganisation: null,
  setOrganisation: (organisation: Organisation) =>
    set((state) => ({ currentOrganisation: organisation })),
}));
