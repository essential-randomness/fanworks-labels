import { defineDb, defineTable, column } from "astro:db";

const BskyAuthSession = defineTable({
  columns: {
    key: column.text({ primaryKey: true }),
    session: column.text(),
  },
});
const BskyAuthState = defineTable({
  columns: {
    key: column.text({ primaryKey: true }),
    state: column.text(),
  },
});
const AuthSession = defineTable({
  columns: {
    key: column.text({ primaryKey: true }),
    session: column.text(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { BskyAuthSession, BskyAuthState, AuthSession },
});
