import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getBskyAgent, getUserDid } from "../auth/utils";

export const server = {
  postLabel: defineAction({
    accept: "form",
    input: z.object({
      post: z.string().url(),
      labels: z.string().array(),
    }),
    handler: async (input, ctx) => {
      const did = await getUserDid(ctx.cookies);
      if (!did) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "No did found for user",
        });
      }
      const agent = await getBskyAgent({ did });
      if (!agent?.did) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Your BlueSky login expired",
        });
      }

      const url = new URL(input.post);
      const key = url.pathname.substring(url.pathname.lastIndexOf("/") + 1);
      try {
        const post = await agent.getPost({
          repo: agent.did,
          rkey: key,
        });
        const request = await fetch("http://127.0.0.1:14832/labels", {
          method: "PUT",
          body: JSON.stringify({
            at_url: post.uri,
            labels: input.labels,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.dir(request, { depth: null });
        const addLabels = await request.json();
        return `thank you for adding ${addLabels.added} and removing ${addLabels.removed} to ${input.post} `;
      } catch (e) {
        throw new ActionError({
          code: "FORBIDDEN",
          message: "Post does not exist or is not yours",
        });
      }
    },
  }),
};
