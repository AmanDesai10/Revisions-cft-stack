"use client";

import { useTransition } from "react";
import { createPost } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import LoadingDots from "@/components/icons/loading-dots";
import { useOrganisationStore } from "@/stores/organisation-store";

export default function CreatePostButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentOrganisation = useOrganisationStore(
    (state) => state.currentOrganisation,
  );

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          if (!currentOrganisation) return;
          const post = await createPost(null, currentOrganisation.id, null);
          router.refresh();
          router.push(`/post/${post.id}`);
        })
      }
      className={cn(
        "flex h-8 w-36 items-center justify-center space-x-2 rounded-lg border text-sm transition-all focus:outline-none sm:h-9",
        isPending
          ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
          : "border border-black bg-black text-white hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
      )}
      disabled={isPending}
    >
      {isPending ? <LoadingDots color="#808080" /> : <p>Create New Post</p>}
    </button>
  );
}
