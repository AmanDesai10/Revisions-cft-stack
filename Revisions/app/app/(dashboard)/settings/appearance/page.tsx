"use client";

import Form from "@/components/form";
import { updateOrganisation } from "@/lib/actions";
import { useOrganisationStore } from "@/stores/organisation-store";

export default async function SiteSettingsAppearance() {
  const currentOrganisation = useOrganisationStore(
    (state) => state.currentOrganisation,
  );

  return (
    <div className="flex flex-col space-y-6">
      <Form
        title="Thumbnail image"
        description="The thumbnail image for your site. Accepted formats: .png, .jpg, .jpeg"
        helpText="Max file size 50MB. Recommended size 1200x630."
        inputAttrs={{
          name: "image",
          type: "file",
          defaultValue: currentOrganisation?.image!,
        }}
        handleSubmit={updateOrganisation}
      />
      <Form
        title="Logo"
        description="The logo for your site. Accepted formats: .png, .jpg, .jpeg"
        helpText="Max file size 50MB. Recommended size 400x400."
        inputAttrs={{
          name: "logo",
          type: "file",
          defaultValue: currentOrganisation?.logo!,
        }}
        handleSubmit={updateOrganisation}
      />
      <Form
        title="Font"
        description="The font for the heading text your site."
        helpText="Please select a font."
        inputAttrs={{
          name: "font",
          type: "select",
          defaultValue: currentOrganisation?.font!,
        }}
        handleSubmit={updateOrganisation}
      />
      <Form
        title="404 Page Message"
        description="Message to be displayed on the 404 page."
        helpText="Please use 240 characters maximum."
        inputAttrs={{
          name: "message404",
          type: "text",
          defaultValue: currentOrganisation?.message404!,
          placeholder: "Blimey! You've found a page that doesn't exist.",
          maxLength: 240,
        }}
        handleSubmit={updateOrganisation}
      />
    </div>
  );
}
