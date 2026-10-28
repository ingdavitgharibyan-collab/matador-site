import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`dishes_allergens\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`dishes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`dishes_allergens_order_idx\` ON \`dishes_allergens\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`dishes_allergens_parent_idx\` ON \`dishes_allergens\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`dishes_option_groups_options\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`price\` numeric DEFAULT 0,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`dishes_option_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`dishes_option_groups_options_order_idx\` ON \`dishes_option_groups_options\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`dishes_option_groups_options_parent_id_idx\` ON \`dishes_option_groups_options\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`dishes_option_groups_options_locales\` (
  	\`name\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`dishes_option_groups_options\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`dishes_option_groups_options_locales_locale_parent_id_unique\` ON \`dishes_option_groups_options_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`dishes_option_groups_options_locales_parent_id_idx\` ON \`dishes_option_groups_options_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`dishes_option_groups\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`multi\` integer DEFAULT false,
  	\`required\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`dishes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`dishes_option_groups_order_idx\` ON \`dishes_option_groups\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`dishes_option_groups_parent_id_idx\` ON \`dishes_option_groups\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`dishes_option_groups_locales\` (
  	\`name\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`dishes_option_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`dishes_option_groups_locales_locale_parent_id_unique\` ON \`dishes_option_groups_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`dishes_option_groups_locales_parent_id_idx\` ON \`dishes_option_groups_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_delivery_zones\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`fee\` numeric DEFAULT 500,
  	\`min_order\` numeric DEFAULT 0,
  	\`free_from\` numeric,
  	\`eta_min\` numeric DEFAULT 30,
  	\`eta_max\` numeric DEFAULT 45,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_delivery_zones_order_idx\` ON \`settings_delivery_zones\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_delivery_zones_parent_id_idx\` ON \`settings_delivery_zones\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_delivery_zones_locales\` (
  	\`name\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings_delivery_zones\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`settings_delivery_zones_locales_locale_parent_id_unique\` ON \`settings_delivery_zones_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`settings_delivery_zones_locales_parent_id_idx\` ON \`settings_delivery_zones_locales\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`dishes\` ADD \`contains_pork\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`dishes\` ADD \`vegetarian\` integer DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`dishes_allergens\`;`)
  await db.run(sql`DROP TABLE \`dishes_option_groups_options\`;`)
  await db.run(sql`DROP TABLE \`dishes_option_groups_options_locales\`;`)
  await db.run(sql`DROP TABLE \`dishes_option_groups\`;`)
  await db.run(sql`DROP TABLE \`dishes_option_groups_locales\`;`)
  await db.run(sql`DROP TABLE \`settings_delivery_zones\`;`)
  await db.run(sql`DROP TABLE \`settings_delivery_zones_locales\`;`)
  await db.run(sql`ALTER TABLE \`dishes\` DROP COLUMN \`contains_pork\`;`)
  await db.run(sql`ALTER TABLE \`dishes\` DROP COLUMN \`vegetarian\`;`)
}
