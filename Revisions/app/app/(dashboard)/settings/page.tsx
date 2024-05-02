"use client";

import Form from "@/components/form";
import { updateOrganisation } from "@/lib/actions";
import DeleteSiteForm from "@/components/form/delete-site-form";
import { useOrganisationStore } from "@/stores/organisation-store";

export default async function SiteSettingsIndex({
  params,
}: {
  params: { id: string };
}) {
  const currentOrganisation = useOrganisationStore(
    (state) => state.currentOrganisation,
  );
  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Name"
        description="The name of your site. This will be used as the meta title on Google as well."
        helpText="Please use 32 characters maximum."
        inputAttrs={{
          name: "name",
          type: "text",
          defaultValue: currentOrganisation?.name!,
          placeholder: "My Awesome Site",
          maxLength: 32,
        }}
        handleSubmit={updateOrganisation}
      />

      <Form
        title="Description"
        description="The description of your site. This will be used as the meta description on Google as well."
        helpText="Include SEO-optimized keywords that you want to rank for."
        inputAttrs={{
          name: "description",
          type: "text",
          defaultValue: currentOrganisation?.description!,
          placeholder: "A blog about really interesting things.",
        }}
        handleSubmit={updateOrganisation}
      />

      <DeleteSiteForm siteName={currentOrganisation?.name!} />
    </div>
  );
}
