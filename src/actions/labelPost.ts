import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getBskyAgent } from "../auth/client";
import labelsConfig from "../../labels";

export const labelPost = defineAction({
  accept: "form",
  input: z.object({
    post: z.string().url(),
    labels: z.string().array(),
  }),
  handler: async (input, ctx) => {
    const did = ctx.locals.session?.userDid;
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
    const hasExtraLabels = input.labels.some(
      (label) =>
        !labelsConfig.labels.find((configLabel) => label == configLabel.value)
    );
    if (hasExtraLabels) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: "You're trying to set a label that does not exist",
      });
    }

    const url = new URL(input.post);
    const key = url.pathname.substring(url.pathname.lastIndexOf("/") + 1);
    let post:
      | {
          uri: string;
          cid: string;
          value: unknown;
        }
      | undefined;
    try {
      post = await agent.getPost({
        repo: agent.did,
        rkey: key,
      });
    } catch (e) {
      throw new ActionError({
        code: "FORBIDDEN",
        message: "Post does not exist or is not yours",
      });
    }
    try {
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

      const addLabels = await request.json();
      return `Thank you for adding ${addLabels.added} and removing ${addLabels.removed} to ${input.post}`;
    } catch (e) {
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "The labeler fucked up... oops!",
      });
    }
  },
});
