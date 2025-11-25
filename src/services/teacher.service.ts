import type { PrismaClient, Teacher } from "@prisma/client";
import { mapToAppError } from "@/utils/errors";
import { type BaseService, createBaseService } from "./base.service";

export type TeacherService = BaseService<Teacher> & {
	getTeacherByEmail(email: string): Promise<Teacher | null>;
	createOrGetTeacher(
		data: { name: string; email: string; contactNumber: string },
		tx: PrismaClient,
	): Promise<Teacher>;
};

export function createTeacherService(prisma: PrismaClient): TeacherService {
	const baseService = createBaseService<Teacher>(prisma.teacher);

	return {
		...baseService,
		async getTeacherByEmail(email: string): Promise<Teacher | null> {
			try {
				const teacher = await prisma.teacher.findUnique({
					where: { email },
				});
				return teacher;
			} catch (error) {
				throw mapToAppError(error);
			}
		},
		async createOrGetTeacher(
			data: { name: string; email: string; contactNumber: string },
			tx: PrismaClient,
		) {
			let teacher = await tx.teacher.findFirst({
				where: { name: data.name },
			});
			if (!teacher) {
				teacher = await tx.teacher.create({
					data: {
						name: data.name,
						email: data.email,
						contactNumber: data.contactNumber || "98000000001",
					},
				});
			}
			return teacher;
		},
	};
}
