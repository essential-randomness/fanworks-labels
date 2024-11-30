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
    id: column.text({ primaryKey: true }),
    userDid: column.text(),
    expiresAt: column.date(),
  },
});
 


// https://astro.build/db/config
export default defineDb({
  tables: { BskyAuthSession, BskyAuthState, AuthSession },
});
