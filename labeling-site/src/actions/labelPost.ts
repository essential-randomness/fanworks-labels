import {
  ActionError,
  defineAction,
  type ActionAPIContext,
} from "astro:actions";
import { z } from "astro:schema";
import { getBskyAgent } from "../auth/client";
import labelsConfig from "../../../labels";

const LABEL_POST_INPUT = z.object({
  post: z.string().url(),
  labels: z.string().array(),
});

// https://bsky.app/profile/fujocoded.bsky.social/post/3l5ft3j46ky2d
const POST_REGEX =
  /bsky.app\/profile\/(?<did>[A-Za-z\.-_0-9]+)\/post\/(?<rkey>[A-Za-z0-9]+)/i;

/**
 * Checks that the user is logged in and that the labels requested are valid,
 * and throws the appropriate ActionErrors as needed.
 *
 * Returns the BlueSky Agent needed to use the API if everything looks right.
 */
const getBlueSkyAgent = async (
  input: z.infer<typeof LABEL_POST_INPUT>,
  ctx: ActionAPIContext
) => {
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

  return agent;
};

export const labelPost = defineAction({
  accept: "form",
  input: LABEL_POST_INPUT,
  handler: async (input, ctx) => {
    const agent = await getBlueSkyAgent(input, ctx);

    const url = new URL(input.post);
    // Get the ID of the post
    const match = url.toString().match(POST_REGEX);
    if (!match) {
      throw new ActionError({
        code: "BAD_REQUEST",
        message: "The post is not valid, sorry!",
      });
    }
    try {
      const post = await agent.getPost({
        repo: match.groups?.did!,
        rkey: match.groups?.rkey!,
      });
      if (post.uri.includes(agent.did!)) {
        // The user asked to label their own post. This is allowed without
        // passing through Discord moderation.
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
          return `Thank you for adding ${addLabels.added.length ? addLabels.added : "nothing"} and removing ${addLabels.removed.length ? addLabels.removed : "nothing"} to ${input.post}`;
        } catch (e) {
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "The labeler fucked up... oops!",
          });
        }
      } else {
        // This is not the logged-in user's post. They can still label it, but it will need to go
        // through Discord moderation first.
        const profile = await agent.getProfile();
        try {
          const request = await fetch("http://127.0.0.1:12000/message", {
            method: "POST",
            body: JSON.stringify({
              post_url: url.toString(),
              at_uri: post.uri,
              requester: profile.data.handle,
              labels: input.labels,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          const addLabels = await request.json();
          return "This post is from a different user, so we sent your request to our moderators for approval.";
        } catch (e) {
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "The labeler fucked up... oops!",
          });
        }
      }
    } catch (e) {
      console.log(e);
      throw new ActionError({
        code: "FORBIDDEN",
        message: "Post does not exist",
      });
    }
  },
});
