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
        await agent.getPost({
          repo: agent.did,
          rkey: key,
        });
        return `thanks ${did} for adding ${input.labels.join(", ")} to ${input.post} `;
      } catch (e) {
        console.log(e);
        throw new ActionError({
          code: "FORBIDDEN",
          message: "Post does not exist or is not yours",
        });
      }
    },
  }),
};
