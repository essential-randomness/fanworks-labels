import { Kysely, Migration, MigrationProvider } from 'kysely'

const migrations: Record<string, Migration> = {}

export const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return migrations
  },
}

migrations['001'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('post')
      .addColumn('uri', 'varchar', (col) => col.primaryKey())
      .addColumn('cid', 'varchar', (col) => col.notNull())
      .addColumn('indexedAt', 'varchar', (col) => col.notNull())
      .execute()
    await db.schema
      .createTable('sub_state')
      .addColumn('service', 'varchar', (col) => col.primaryKey())
      .addColumn('cursor', 'integer', (col) => col.notNull())
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable('post').execute()
    await db.schema.dropTable('sub_state').execute()
  },
}

migrations['002'] = {
  async up(db: Kysely<unknown>) {
    await db.schema
      .createTable('label')
      .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
      .addColumn('post_uri', 'varchar', (col) => col.notNull())
      .addColumn('label', 'varchar', (col) => col.notNull())
      .addUniqueConstraint('post_uri_label_unique', ['label', 'post_uri'])
      .addForeignKeyConstraint('post_uri_foreign', ['post_uri'], 'post', [
        'uri',
      ])
      .execute()
    await db.schema
      .createIndex('label_index')
      .on('label')
      .column('label')
      .execute()
    await db.schema
      .createIndex('post_uri_index')
      .on('label')
      .column('post_uri')
      .execute()
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropIndex('label_index').execute()
    await db.schema.dropIndex('post_uri_index').execute()
    await db.schema.dropTable('label').execute()
  },
}
