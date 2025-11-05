import type { PrismaClient, Teacher } from "@prisma/client";
import { mapToAppError } from "@/utils/errors";
import { type BaseService, createBaseService } from "./base.service";

export type TeacherService = BaseService<Teacher> & {
	getTeacherByEmail(email: string): Promise<Teacher | null>;
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
	};
}
