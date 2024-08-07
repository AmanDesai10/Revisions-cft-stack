"use client";

import Form from "@/components/form";
import { updateOrganisation } from "@/lib/actions";
import { useOrganisationStore } from "@/stores/organisation-store";

export default async function SiteSettingsDomains() {
  const currentOrganisation = useOrganisationStore(
    (state) => state.currentOrganisation,
  );

  if (!currentOrganisation) return null;

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Subdomain"
        description="The subdomain for your site."
        helpText="Please use 32 characters maximum."
        inputAttrs={{
          name: "subdomain",
          type: "text",
          defaultValue: currentOrganisation?.subdomain!,
          placeholder: "subdomain",
          maxLength: 32,
        }}
        handleSubmit={(e: FormData) =>
          updateOrganisation(e, currentOrganisation.id, "subdomain")
        }
      />
      {/* <Form
        title="Custom Domain"
        description="The custom domain for your site."
        helpText="Please enter a valid domain."
        inputAttrs={{
          name: "customDomain",
          type: "text",
          defaultValue: data?.customDomain!,
          placeholder: "yourdomain.com",
          maxLength: 64,
          pattern: "^[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}$",
        }}
        handleSubmit={updateOrganisation}
      /> */}
    </div>
  );
}
