import { LabelerServer } from "@skyware/labeler";
import fastify from "fastify";
import "dotenv/config";

const server = new LabelerServer({
  did: process.env.LABELER_DID!,
  signingKey: process.env.SIGNING_KEY!,
});
const myServer = fastify();

myServer.route({
  method: "GET",
  url: "/labels",
  schema: {
    response: {
      200: {
        type: "object",
        properties: {
          hello: { type: "string" },
        },
      },
    },
  },
  handler: (request, reply) => {
    const post = "did:plc:r2vpg2iszskbkegoldmqa322";
    console.log(post);
    const label = server.createLabel({
      val: "fanfic",
      uri: post,
    });
    console.log(label);
    reply.send({ hello: "world" });
  },
});

server.app.listen({ port: 14831 }, (error) => {
  console.log("Here4");
  if (error) {
    console.error("Failed to start server:", error);
  } else {
    console.log("Labeler server running on port 14831");
  }
});

myServer.listen({ port: 14832 }, (error) => {
  if (error) {
    console.error("Failed to start server:", error);
  } else {
    console.log("Labeler server running on port 14832");
  }
});
