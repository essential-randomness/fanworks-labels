# BlueSky FanWorks Labeler + Feeds + Website

This project puts together a few BlueSky concepts in a single package. It allows
people to:

- Create a labeler that people can subscribe to and that can apply labels to
  specific posts
- Create a website where people can submit posts with labels to add to them
- Create multiple feeds, one for each label plus a global one
- Add Discord moderation for the labels, holding back labeling until a post has
  been reviewed

This codebase features a "fanworks labeler" where people can mark their posts as
including a specific type of fanwork. You can check out the labeling site at
[https://labelfanworks.fujocoded.com/](https://labelfanworks.fujocoded.com/) and
the labeler + feeds at
[https://bsky.app/profile/fanworkslabels.bsky.social](https://bsky.app/profile/fanworkslabels.bsky.social).

You can edit this codebase to create your own! If you need help, find us at
[https://fujocoded.com](https://fujocoded.com).

## The Moving Parts

![Diagram of all the moving parts of the
architecture](./architecture3.excalidraw.png)

### Labels configuration

Labels are configured in [./labels.ts](./blob/main/labels.ts). All other parts
will read the configuration from this file and create the appropriate
labels/feeds/options.

### Labels Server

You can find the server for our labels in the
[labels-server/](./blob/main/labels-server/) directory. It uses
[@skyware/labeler](https://www.npmjs.com/package/@skyware/labeler) to create a
server that serves labels according to the AtProto specification.

### Feeds Server

You can find the server for our feeds in the
[feed-server/](./blob/main/feed-server/) directory. It's a fork of [BlueSky's
own feed generator template](https://github.com/bluesky-social/feed-generator).

### Labeling Website

You can find the labeling website in the
[labeling-site/](./blob/main/labeling-site/) directory. This is an [Astro
website](https://astro.build/) that uses OAuth to let people log in with their
own BlueSky account and label their own posts.

### Discord Bot

You can find our Discord bot in the [discord-bot/](./blob/main/feed-server/)
directory. It uses [Discord.js](https://www.npmjs.com/package/discord.js) under
the hood. You should refer to their Getting Started guide for instructions on
[setting up your
bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot).

## Remaining TODOs:

- [x] Make local OAuth work
- [x] Fix issue with Astro site and cookies
- [ ] Test new feed server and migrate the one in production
- [ ] Allow Discord Bot to label posts that are older than 2 hours
- [ ] Add environment variables for server URLs
- [ ] Add environment variables for database paths
- [ ] Add NixOS configuration
- [ ] Set up a new one from scratch and write how to do it

### Stretch TODOs

- [ ] Allow moderators to add other labels to a post via Discord Emojis
- [ ] Better error handling in site
- [ ] Allow to only turn on some parts of this system
- [ ] Get recordings for this polished and published
