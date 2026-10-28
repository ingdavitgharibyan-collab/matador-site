import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`orders_lines\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`qty\` numeric,
  	\`label\` text,
  	\`unit\` numeric,
  	\`dish\` text,
  	\`opts\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`orders\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`orders_lines_order_idx\` ON \`orders_lines\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`orders_lines_parent_id_idx\` ON \`orders_lines\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`orders_status_log\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`status\` text,
  	\`at\` text,
  	\`by\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`orders\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`orders_status_log_order_idx\` ON \`orders_status_log\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`orders_status_log_parent_id_idx\` ON \`orders_status_log\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`orders\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`ref\` text NOT NULL,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`total\` numeric NOT NULL,
  	\`mode\` text NOT NULL,
  	\`table\` text,
  	\`zone\` text,
  	\`payment\` text,
  	\`name\` text,
  	\`phone\` text,
  	\`address\` text,
  	\`flat\` text,
  	\`note\` text,
  	\`subtotal\` numeric,
  	\`fee\` numeric,
  	\`channel\` text,
  	\`lang\` text,
  	\`token\` text,
  	\`kitchen_message_id\` text,
  	\`ip_hash\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`orders_ref_idx\` ON \`orders\` (\`ref\`);`)
  await db.run(sql`CREATE INDEX \`orders_status_idx\` ON \`orders\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`orders_phone_idx\` ON \`orders\` (\`phone\`);`)
  await db.run(sql`CREATE INDEX \`orders_token_idx\` ON \`orders\` (\`token\`);`)
  await db.run(sql`CREATE INDEX \`orders_updated_at_idx\` ON \`orders\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`orders_created_at_idx\` ON \`orders\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`_dishes_v_version_allergens\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_dishes_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_dishes_v_version_allergens_order_idx\` ON \`_dishes_v_version_allergens\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_dishes_v_version_allergens_parent_idx\` ON \`_dishes_v_version_allergens\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_dishes_v_version_option_groups_options\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`price\` numeric DEFAULT 0,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_dishes_v_version_option_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_dishes_v_version_option_groups_options_order_idx\` ON \`_dishes_v_version_option_groups_options\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_dishes_v_version_option_groups_options_parent_id_idx\` ON \`_dishes_v_version_option_groups_options\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_dishes_v_version_option_groups_options_locales\` (
  	\`name\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_dishes_v_version_option_groups_options\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_dishes_v_version_option_groups_options_locales_locale_paren\` ON \`_dishes_v_version_option_groups_options_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_dishes_v_version_option_groups_options_locales_parent_i_idx\` ON \`_dishes_v_version_option_groups_options_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_dishes_v_version_option_groups\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`multi\` integer DEFAULT false,
  	\`required\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_dishes_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_dishes_v_version_option_groups_order_idx\` ON \`_dishes_v_version_option_groups\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_dishes_v_version_option_groups_parent_id_idx\` ON \`_dishes_v_version_option_groups\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_dishes_v_version_option_groups_locales\` (
  	\`name\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_dishes_v_version_option_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_dishes_v_version_option_groups_locales_locale_parent_id_uni\` ON \`_dishes_v_version_option_groups_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_dishes_v_version_option_groups_locales_parent_id_idx\` ON \`_dishes_v_version_option_groups_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_dishes_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_category_id\` integer NOT NULL,
  	\`version_price\` numeric NOT NULL,
  	\`version_weight\` text,
  	\`version_order\` numeric DEFAULT 0,
  	\`version_available\` integer DEFAULT true,
  	\`version_spicy\` integer DEFAULT false,
  	\`version_signature\` integer DEFAULT false,
  	\`version_contains_pork\` integer DEFAULT false,
  	\`version_vegetarian\` integer DEFAULT false,
  	\`version_photo_id\` integer,
  	\`version_art\` text DEFAULT 'burger',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`dishes\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_dishes_v_parent_idx\` ON \`_dishes_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_dishes_v_version_version_category_idx\` ON \`_dishes_v\` (\`version_category_id\`);`)
  await db.run(sql`CREATE INDEX \`_dishes_v_version_version_photo_idx\` ON \`_dishes_v\` (\`version_photo_id\`);`)
  await db.run(sql`CREATE INDEX \`_dishes_v_version_version_updated_at_idx\` ON \`_dishes_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_dishes_v_version_version_created_at_idx\` ON \`_dishes_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_dishes_v_created_at_idx\` ON \`_dishes_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_dishes_v_updated_at_idx\` ON \`_dishes_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE TABLE \`_dishes_v_locales\` (
  	\`version_name\` text NOT NULL,
  	\`version_description\` text,
  	\`version_ingredients\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_dishes_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_dishes_v_locales_locale_parent_id_unique\` ON \`_dishes_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_dishes_v_locales_parent_id_idx\` ON \`_dishes_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_settings_v_version_hours\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`open\` text DEFAULT '11:00',
  	\`close\` text DEFAULT '02:00',
  	\`closed\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_settings_v_version_hours_order_idx\` ON \`_settings_v_version_hours\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_settings_v_version_hours_parent_id_idx\` ON \`_settings_v_version_hours\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_settings_v_version_closures\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`from\` text NOT NULL,
  	\`to\` text NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_settings_v_version_closures_order_idx\` ON \`_settings_v_version_closures\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_settings_v_version_closures_parent_id_idx\` ON \`_settings_v_version_closures\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_settings_v_version_closures_locales\` (
  	\`note\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_settings_v_version_closures\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_settings_v_version_closures_locales_locale_parent_id_unique\` ON \`_settings_v_version_closures_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_settings_v_version_closures_locales_parent_id_idx\` ON \`_settings_v_version_closures_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_settings_v_version_payment_methods\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_settings_v_version_payment_methods_order_idx\` ON \`_settings_v_version_payment_methods\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_settings_v_version_payment_methods_parent_idx\` ON \`_settings_v_version_payment_methods\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_settings_v_version_delivery_zones\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`fee\` numeric DEFAULT 500,
  	\`min_order\` numeric DEFAULT 0,
  	\`free_from\` numeric,
  	\`eta_min\` numeric DEFAULT 30,
  	\`eta_max\` numeric DEFAULT 45,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_settings_v_version_delivery_zones_order_idx\` ON \`_settings_v_version_delivery_zones\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_settings_v_version_delivery_zones_parent_id_idx\` ON \`_settings_v_version_delivery_zones\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_settings_v_version_delivery_zones_locales\` (
  	\`name\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_settings_v_version_delivery_zones\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_settings_v_version_delivery_zones_locales_locale_parent_id_\` ON \`_settings_v_version_delivery_zones_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_settings_v_version_delivery_zones_locales_parent_id_idx\` ON \`_settings_v_version_delivery_zones_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_settings_v_version_partners\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`url\` text NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_settings_v_version_partners_order_idx\` ON \`_settings_v_version_partners\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_settings_v_version_partners_parent_id_idx\` ON \`_settings_v_version_partners\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_settings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_phone\` text NOT NULL,
  	\`version_whatsapp\` text,
  	\`version_telegram\` text,
  	\`version_instagram\` text,
  	\`version_facebook\` text,
  	\`version_lat\` numeric NOT NULL,
  	\`version_lng\` numeric NOT NULL,
  	\`version_orders_paused\` integer DEFAULT false,
  	\`version_last_order_minutes\` numeric DEFAULT 30,
  	\`version_delivery_fee\` numeric DEFAULT 0,
  	\`version_free_delivery_from\` numeric,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`_settings_v_created_at_idx\` ON \`_settings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_settings_v_updated_at_idx\` ON \`_settings_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE TABLE \`_settings_v_locales\` (
  	\`version_address\` text NOT NULL,
  	\`version_pause_note\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_settings_v_locales_locale_parent_id_unique\` ON \`_settings_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_settings_v_locales_parent_id_idx\` ON \`_settings_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`role\` text DEFAULT 'owner' NOT NULL;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`orders_id\` integer REFERENCES orders(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_orders_id_idx\` ON \`payload_locked_documents_rels\` (\`orders_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`orders_lines\`;`)
  await db.run(sql`DROP TABLE \`orders_status_log\`;`)
  await db.run(sql`DROP TABLE \`orders\`;`)
  await db.run(sql`DROP TABLE \`_dishes_v_version_allergens\`;`)
  await db.run(sql`DROP TABLE \`_dishes_v_version_option_groups_options\`;`)
  await db.run(sql`DROP TABLE \`_dishes_v_version_option_groups_options_locales\`;`)
  await db.run(sql`DROP TABLE \`_dishes_v_version_option_groups\`;`)
  await db.run(sql`DROP TABLE \`_dishes_v_version_option_groups_locales\`;`)
  await db.run(sql`DROP TABLE \`_dishes_v\`;`)
  await db.run(sql`DROP TABLE \`_dishes_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_settings_v_version_hours\`;`)
  await db.run(sql`DROP TABLE \`_settings_v_version_closures\`;`)
  await db.run(sql`DROP TABLE \`_settings_v_version_closures_locales\`;`)
  await db.run(sql`DROP TABLE \`_settings_v_version_payment_methods\`;`)
  await db.run(sql`DROP TABLE \`_settings_v_version_delivery_zones\`;`)
  await db.run(sql`DROP TABLE \`_settings_v_version_delivery_zones_locales\`;`)
  await db.run(sql`DROP TABLE \`_settings_v_version_partners\`;`)
  await db.run(sql`DROP TABLE \`_settings_v\`;`)
  await db.run(sql`DROP TABLE \`_settings_v_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`categories_id\` integer,
  	\`dishes_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`dishes_id\`) REFERENCES \`dishes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "categories_id", "dishes_id", "media_id", "users_id") SELECT "id", "order", "parent_id", "path", "categories_id", "dishes_id", "media_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_dishes_id_idx\` ON \`payload_locked_documents_rels\` (\`dishes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`role\`;`)
}
