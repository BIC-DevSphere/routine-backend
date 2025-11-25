import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import errorHandlingExtension from "../middleware/prisma";

declare global {
	var __prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

const prisma: PrismaClient =
	global.__prisma ??
	(new PrismaClient({
		log: ["error"],
		adapter,
	}).$extends(errorHandlingExtension) as PrismaClient);

if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

export default prisma;
