import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`promo_codes\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`code\` text NOT NULL,
  	\`active\` integer DEFAULT true,
  	\`kind\` text DEFAULT 'percent' NOT NULL,
  	\`value\` numeric DEFAULT 10,
  	\`min_order\` numeric DEFAULT 0,
  	\`valid_from\` text,
  	\`valid_to\` text,
  	\`max_uses\` numeric,
  	\`uses\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`promo_codes_code_idx\` ON \`promo_codes\` (\`code\`);`)
  await db.run(sql`CREATE INDEX \`promo_codes_updated_at_idx\` ON \`promo_codes\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`promo_codes_created_at_idx\` ON \`promo_codes\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`metrics\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`day\` text NOT NULL,
  	\`counts\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`metrics_day_idx\` ON \`metrics\` (\`day\`);`)
  await db.run(sql`CREATE INDEX \`metrics_updated_at_idx\` ON \`metrics\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`metrics_created_at_idx\` ON \`metrics\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`discount\` numeric;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`promo\` text;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`promo_codes_id\` integer REFERENCES promo_codes(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`metrics_id\` integer REFERENCES metrics(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_promo_codes_id_idx\` ON \`payload_locked_documents_rels\` (\`promo_codes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_metrics_id_idx\` ON \`payload_locked_documents_rels\` (\`metrics_id\`);`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`legal_name\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`tax_id\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`privacy_email\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`retention_days\` numeric DEFAULT 180;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`google_review_url\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`google_maps_url\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`yandex_maps_url\` text;`)
  await db.run(sql`ALTER TABLE \`settings\` ADD \`two_gis_url\` text;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` ADD \`version_legal_name\` text;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` ADD \`version_tax_id\` text;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` ADD \`version_privacy_email\` text;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` ADD \`version_retention_days\` numeric DEFAULT 180;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` ADD \`version_google_review_url\` text;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` ADD \`version_google_maps_url\` text;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` ADD \`version_yandex_maps_url\` text;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` ADD \`version_two_gis_url\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`promo_codes\`;`)
  await db.run(sql`DROP TABLE \`metrics\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`orders_id\` integer,
  	\`dishes_id\` integer,
  	\`categories_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`orders_id\`) REFERENCES \`orders\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`dishes_id\`) REFERENCES \`dishes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "orders_id", "dishes_id", "categories_id", "media_id", "users_id") SELECT "id", "order", "parent_id", "path", "orders_id", "dishes_id", "categories_id", "media_id", "users_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_orders_id_idx\` ON \`payload_locked_documents_rels\` (\`orders_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_dishes_id_idx\` ON \`payload_locked_documents_rels\` (\`dishes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`discount\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`promo\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`legal_name\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`tax_id\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`privacy_email\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`retention_days\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`google_review_url\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`google_maps_url\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`yandex_maps_url\`;`)
  await db.run(sql`ALTER TABLE \`settings\` DROP COLUMN \`two_gis_url\`;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` DROP COLUMN \`version_legal_name\`;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` DROP COLUMN \`version_tax_id\`;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` DROP COLUMN \`version_privacy_email\`;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` DROP COLUMN \`version_retention_days\`;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` DROP COLUMN \`version_google_review_url\`;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` DROP COLUMN \`version_google_maps_url\`;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` DROP COLUMN \`version_yandex_maps_url\`;`)
  await db.run(sql`ALTER TABLE \`_settings_v\` DROP COLUMN \`version_two_gis_url\`;`)
}
