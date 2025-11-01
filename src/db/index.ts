import { PrismaClient } from "@prisma/client";
import errorHandlingExtension from "../middleware/prisma";

declare global {
	var __prisma: PrismaClient | undefined;
}

const prisma: PrismaClient =
	global.__prisma ??
	(new PrismaClient({
		log: ["query", "error"],
	}).$extends(errorHandlingExtension) as PrismaClient);

if (process.env.NODE_ENV !== "production") global.__prisma = prisma;

export default prisma;
