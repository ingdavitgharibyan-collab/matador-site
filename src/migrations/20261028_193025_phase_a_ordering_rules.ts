import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`settings_closures\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`from\` text NOT NULL,
  	\`to\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_closures_order_idx\` ON \`settings_closures\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_closures_parent_id_idx\` ON \`settings_closures\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_closures_locales\` (
  	\`note\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings_closures\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`settings_closures_locales_locale_parent_id_unique\` ON \`settings_closures_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`settings_closures_locales_parent_id_idx\` ON \`settings_closures_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_payment_methods\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_payment_methods_order_idx\` ON \`settings_payment_methods\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`settings_payment_methods_parent_idx\` ON \`settings_payment_methods\` (\`parent_id\`);`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`orders_paused\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`last_order_minutes\` numeric DEFAULT 30;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` ADD \`pause_note\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`settings_closures\`;`)
  await db.run(sql`DROP TABLE \`settings_closures_locales\`;`)
  await db.run(sql`DROP TABLE \`settings_payment_methods\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`orders_paused\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`last_order_minutes\`;`)
  await db.run(sql`ALTER TABLE \`settings_locales\` DROP COLUMN \`pause_note\`;`)
}
