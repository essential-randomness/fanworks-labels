# Phase 1 — Self-serve labeler

In this phase only the owner of a post can label a post with the
selected labels. We verify that the user is the owner when they
share the link to the Astro site, and then send the request to
our labelING server.

![ALT](./architecture.excalidraw.png)

# Phase 2 — Moderated labeler

In this phase, the label request is sent to a Discord server for
approval and/or moderation.

![ALT](./architecture2.excalidraw.png)
