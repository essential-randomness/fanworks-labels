import { LabelerServer } from "@skyware/labeler";
import fastify, { type FastifyRequest } from "fastify";
import "dotenv/config";
import { fetchCurrentLabels } from "./utils";
import labelsConfig from "../labels";
import sqlite3 from "sqlite3";
const db = new sqlite3.Database("../feed-server/feed.sqlite");

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

    const hasExtraLabels = body.labels.some(
      (label) =>
        !labelsConfig.labels.find((configLabel) => label == configLabel.value)
    );
    if (hasExtraLabels) {
      reply.status(500).send({
        message: "You have extra labels",
      });
    }

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

    if (currentLabels.size == 0 && labelsToAdd.length > 0) {
      db.run(
        "INSERT INTO post(uri, cid, indexedAt) VALUES ($uri, $cid, $indexedAt);",
        {
          $uri: body.at_url,
          $cid: "whatever",
          $indexedAt: new Date().toISOString(),
        },
        (e) => {
          console.log(e);
          console.log("Added post to feed");
        }
      );
    }

    if (
      labelsToAdd.length == 0 &&
      currentLabels.size == labelsToRemove.length
    ) {
      db.run(
        "DELETE FROM post WHERE uri = $uri;",
        {
          $uri: body.at_url,
        },
        (e) => {
          console.log(e);
          console.log("Removed post from feed");
        }
      );
    }

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
