"use server";

import prisma from "@/lib/prisma";
import { Post, Organisation, User } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";
import { withPostAuth, withOrganisationAuth } from "./auth";
import { getSession } from "@/lib/auth";
import {
  addDomain,
  removeDomain,
  validDomainRegex,
} from "@/lib/domains";
import { S3 } from "@aws-sdk/client-s3";
import { customAlphabet } from "nanoid";
import { getBlurDataURL } from "@/lib/utils";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

const s3Client = new S3({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_BUCKET_ENDPOINT,
});

export const createOrganisation = async (formData: FormData) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const subdomain = formData.get("subdomain") as string;

  try {
    const response = await prisma.organisation.create({
      data: {
        name,
        description,
        subdomain,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });
    revalidateTag(
      `${subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
    );
    // lambda function to send email to user on successful creation of organisation
    const emailResponse = await fetch(process.env.AWS_APIGATEWAY_URL + "/sendemail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: session.user.email,
        message: "Thank you for creating an organisation on Revisions! Here are some next steps to get started: \n\n1. Create a new post by clicking on the 'New Post' button on your dashboard. \n2. Share your organisation's URL with your audience to start publishing content. We also provided you with a subdomain to get started: http://" + subdomain + ".revisions.tech",
        subject: "Get started with your new organisation",
      }),
    });
    console.log("Email sent: ", emailResponse);
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This subdomain is already taken`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};

export const updateOrganisation = withOrganisationAuth(
  async (formData: FormData, organisation: Organisation, key: string) => {
    const value = formData.get(key) as string;

    try {
      let response;

      if (key === "customDomain") {
        if (value.includes("revisions.tech")) {
          return {
            error: "Cannot use revisions.tech subdomain as your custom domain",
          };

          // if the custom domain is valid, we need to add it
        } else if (validDomainRegex.test(value)) {
          response = await prisma.organisation.update({
            where: {
              id: organisation.id,
            },
            data: {
              customDomain: value,
            },
          });
          await Promise.all([addDomain(value)]);

          // empty value means the user wants to remove the custom domain
        } else if (value === "") {
          response = await prisma.organisation.update({
            where: {
              id: organisation.id,
            },
            data: {
              customDomain: null,
            },
          });
        }

        // if the organisation had a different customDomain before, we need to remove it first
        if (organisation.customDomain && organisation.customDomain !== value) {
          response = await removeDomain(organisation.customDomain);
        }
      } else if (key === "image" || key === "logo") {
        if (!process.env.AWS_CLOUDFRONT_URL) {
          return {
            error:
              "Missing AWS_CLOUDFRONT_URL. Don't forget to add that to your .env file.",
          };
        }

        const file = formData.get(key) as File;
        const filename = `${nanoid()}.${file.type.split("/")[1]}`;

        await s3Client.putObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: filename,
          Body: Buffer.from(await file.arrayBuffer()),
          ContentType: file.type,
        });
        const url = `${process.env.AWS_CLOUDFRONT_URL}/${filename}`;
        console.log("URL: ", url);

        const blurhash = key === "image" ? await getBlurDataURL(url) : null;

        response = await prisma.organisation.update({
          where: {
            id: organisation.id,
          },
          data: {
            [key]: url,
            ...(blurhash && { imageBlurhash: blurhash }),
          },
        });
      } else {
        response = await prisma.organisation.update({
          where: {
            id: organisation.id,
          },
          data: {
            [key]: value,
          },
        });
      }
      console.log(
        "Updated organisation data! Revalidating tags: ",
        `${organisation.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
        `${organisation.customDomain}-metadata`,
      );
      revalidateTag(
        `${organisation.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      organisation.customDomain &&
        revalidateTag(`${organisation.customDomain}-metadata`);

      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: `This ${key} is already taken`,
        };
      } else {
        return {
          error: error.message,
        };
      }
    }
  },
);

export const deleteOrganisation = withOrganisationAuth(
  async (_: FormData, organisation: Organisation) => {
    try {
      const response = await prisma.organisation.delete({
        where: {
          id: organisation.id,
        },
      });
      revalidateTag(
        `${organisation.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      response.customDomain &&
        revalidateTag(`${organisation.customDomain}-metadata`);
      return response;
    } catch (error: any) {
      return {
        error: error.message,
      };
    }
  },
);

export const getOrganisationFromPostId = async (postId: string) => {
  return await unstable_cache(
    async () => {
      const post = await prisma.post.findUnique({
        where: {
          id: postId,
        },
        select: {
          organisationId: true,
        },
      });
      return post?.organisationId;
    },
    [`${postId}-post`],
    {
      revalidate: 900,
      tags: [`${postId}-post`],
    },
  )();
};

export const createPost = withOrganisationAuth(
  async (_: FormData, organisation: Organisation) => {
    const session = await getSession();
    if (!session?.user.id) {
      return {
        error: "Not authenticated",
      };
    }
    const response = await prisma.post.create({
      data: {
        organisationId: organisation.id,
        userId: session.user.id,
      },
    });

    revalidateTag(
      `${organisation.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
    );
    organisation.customDomain &&
      revalidateTag(`${organisation.customDomain}-posts`);

    return response;
  },
);

// creating a separate function for this because we're not using FormData
export const updatePost = async (data: Post) => {
  console.log("Updating post data! Revalidating tags: ");
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const post = await prisma.post.findUnique({
    where: {
      id: data.id,
    },
    include: {
      organisation: true,
    },
  });
  if (!post || post.userId !== session.user.id) {
    return {
      error: "Post not found",
    };
  }
  try {
    const response = await prisma.post.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
      },
    });

    revalidateTag(
      `${post.organisation?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
    );
    revalidateTag(
      `${post.organisation?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${post.slug}`,
    );

    // if the organisation has a custom domain, we need to revalidate those tags too
    post.organisation?.customDomain &&
      (revalidateTag(`${post.organisation?.customDomain}-posts`),
        revalidateTag(`${post.organisation?.customDomain}-${post.slug}`));

    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
};

export const updatePostMetadata = withPostAuth(
  async (
    formData: FormData,
    post: Post & {
      organisation: Organisation;
    },
    key: string,
  ) => {
    const value = formData.get(key) as string;

    try {
      const session = await getSession();
      if (!session?.user.id) {
        return {
          error: "Not authenticated",
        };
      }
      let response;
      if (key === "image") {
        const file = formData.get("image") as File;
        const filename = `${nanoid()}.${file.type.split("/")[1]}`;

        await s3Client.putObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: filename,
          Body: Buffer.from(await file.arrayBuffer()),
          ContentType: file.type,
          // ACL: "public-read",
        });

        const url = `${process.env.AWS_CLOUDFRONT_URL}/${filename}`;
        console.log("URL: ", url);

        const blurhash = await getBlurDataURL(url);

        response = await prisma.post.update({
          where: {
            id: post.id,
          },
          data: {
            image: url,
            imageBlurhash: blurhash,
          },
        });
      } else {
        response = await prisma.post.update({
          where: {
            id: post.id,
          },
          data: {
            [key]: key === "published" ? value === "true" : value,
          },
        });
      }

      // lambda function to send email to user on successful creation of organisation
      const emailResponse = await fetch(process.env.AWS_APIGATEWAY_URL + "/sendemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          message: "Your new post is published, and live!\n\nYou can view it here: http://" + post.organisation?.subdomain + ".revisions.tech/" + post.slug,
          subject: "Your new post is published, and live!",
        }),
      });
      revalidateTag(
        `${post.organisation?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
      );
      revalidateTag(
        `${post.organisation?.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-${post.slug}`,
      );

      // if the organisation has a custom domain, we need to revalidate those tags too
      post.organisation?.customDomain &&
        (revalidateTag(`${post.organisation?.customDomain}-posts`),
          revalidateTag(`${post.organisation?.customDomain}-${post.slug}`));

      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: `This slug is already in use`,
        };
      } else {
        return {
          error: error.message,
        };
      }
    }
  },
);

export const deletePost = withPostAuth(async (_: FormData, post: Post) => {
  try {
    const response = await prisma.post.delete({
      where: {
        id: post.id,
      },
      select: {
        organisationId: true,
      },
    });
    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
});

export const editUser = async (
  formData: FormData,
  _id: unknown,
  key: string,
) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  const value = formData.get(key) as string;

  try {
    const response = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        [key]: value,
      },
    });
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This ${key} is already in use`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};

export const updateUser = async (user: User) => {
  const session = await getSession();
  if (!session?.user.id) {
    return {
      error: "Not authenticated",
    };
  }
  try {
    const response = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: user,
    });
    return response;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This ${error.meta.target} is already in use`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};
