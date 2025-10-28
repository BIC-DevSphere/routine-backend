import prisma from "@/db";

export abstract class BaseService {
	protected db = prisma;
}
