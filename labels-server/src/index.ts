import { LabelerServer } from "@skyware/labeler";
import fastify, { type FastifyRequest } from "fastify";
import "dotenv/config";
import { fetchCurrentLabels } from "./utils";
import labelsConfig from "./labels";
import { z } from "zod";

const ENVIRONMENT = z
  .object({
    FEED_SERVER_URL: z.string(),
    LABELER_DID: z.string(),
    LABELER_SIGNING_KEY: z.string(),
    LABELER_SERVER_PORT: z.number({ coerce: true }),
    LABELING_SERVER_PORT: z.number({ coerce: true }),
    LABELER_DB_PATH: z.string().optional(),
  })
  .parse(process.env);

const labelerServer = new LabelerServer({
  did: ENVIRONMENT.LABELER_DID,
  signingKey: ENVIRONMENT.LABELER_SIGNING_KEY,
  dbPath: ENVIRONMENT.LABELER_DB_PATH,
});
const labelingServer = fastify();

type BodyType = {
  at_url: string;
  labels: string[];
};

labelingServer.route({
  method: "PUT",
  url: "/labels",
  schema: {
    request: {
      type: "object",
      properties: {
        at_url: {
          type: "string",
        },
        labels: {
          type: "array",
        },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          added: { type: "array" },
          removed: { type: "array" },
        },
      },
    },
  },
  handler: (request: FastifyRequest<{ Body: BodyType }>, reply) => {
    const body = request.body;

    // Check whether the request includes labels that aren't present in our
    // configuration and reject them.
    const hasExtraLabels = body.labels.some(
      (label) =>
        !labelsConfig.labels.find((configLabel) => label == configLabel.value)
    );
    if (hasExtraLabels) {
      reply.status(500).send({
        message: "You have extra labels",
      });
    }

    // Get the current labels for the requested post and determine which labels
    // we're adding and which ones we're removing.
    const currentLabels = fetchCurrentLabels(labelerServer, body.at_url);
    const labelsToAdd = body.labels.filter(
      (label) => !currentLabels.has(label)
    );
    const labelsToRemove = Array.from(
      currentLabels.difference(new Set(body.labels))
    );

    for (const toAdd of labelsToAdd) {
      labelerServer.createLabel({
        uri: body.at_url,
        val: toAdd,
      });
    }
    for (const toRemove of labelsToRemove) {
      labelerServer.createLabel({
        uri: body.at_url,
        val: toRemove,
        neg: true,
      });
    }
    fetch(new URL("/labels/", ENVIRONMENT.FEED_SERVER_URL), {
      method: "PUT",
      body: JSON.stringify({
        uri: body.at_url,
        labels: body.labels,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    reply.send({ added: labelsToAdd, removed: labelsToRemove });
  },
});

labelerServer.app.listen({ port: ENVIRONMENT.LABELER_SERVER_PORT }, (error) => {
  if (error) {
    console.error("Failed to start server:", error);
  } else {
    console.log(
      `Labeler server running on port ${ENVIRONMENT.LABELER_SERVER_PORT}`
    );
  }
});

labelingServer.listen({ port: ENVIRONMENT.LABELING_SERVER_PORT }, (error) => {
  if (error) {
    console.error("Failed to start server:", error);
  } else {
    console.log(
      `Labeling server running on port ${ENVIRONMENT.LABELING_SERVER_PORT}`
    );
  }
});
