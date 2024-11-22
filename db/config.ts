import { defineDb, defineTable, column } from "astro:db";

const AuthSession = defineTable({
  columns: {
    key: column.text({ primaryKey: true }),
    session: column.text(),
  },
});
const AuthState = defineTable({
  columns: {
    key: column.text({ primaryKey: true }),
    state: column.text(),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { AuthSession, AuthState },
});
