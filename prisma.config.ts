import path from "node:path";
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
	datasource: {
		url: env("DATABASE_URL"),
		// shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
	},
	schema: path.join("src", "db", "prisma", "schema", "schema.prisma"),
	// schema: "src/db/prisma/schema",
	migrations: {
		path: path.join("src", "db", "prisma", "schema", "migrations"),
	},
	// migrations: {
	// 	path: "src/db/prisma/migrations",
	// },
});
