import { LabelerServer } from "@skyware/labeler";
import fastify, { type FastifyRequest } from "fastify";
import "dotenv/config";
import { fetchCurrentLabels } from "./utils";
import labelsConfig from "../../labels";

const labelerServer = new LabelerServer({
  did: process.env.LABELER_DID!,
  signingKey: process.env.SIGNING_KEY!,
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
    fetch("http://127.0.0.1:14833/labels/", {
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

labelerServer.app.listen({ port: 14831 }, (error) => {
  if (error) {
    console.error("Failed to start server:", error);
  } else {
    console.log("Labeler server running on port 14831");
  }
});

labelingServer.listen({ port: 14832 }, (error) => {
  if (error) {
    console.error("Failed to start server:", error);
  } else {
    console.log("Labeling server running on port 14832");
  }
});
