import { DatabaseError, mapToAppError, NotFoundError } from "@/utils/errors";

export type BaseService<T> = {
	getById(id: string): Promise<T | null>;
	getAll(): Promise<T[]>;
	create(data: any): Promise<T>;
	update(id: string, data: any): Promise<T>;
	delete(id: string): Promise<T>;
};

export function createBaseService<T>(
	model: any, // Using any to work with Prisma delegate types
): BaseService<T> {
	return {
		async getById(id: string): Promise<T | null> {
			try {
				const result = await model.findUnique({
					where: { id },
				});
				return result;
			} catch (error) {
				throw mapToAppError(error);
			}
		},

		async getAll(): Promise<T[]> {
			try {
				const results = await model.findMany();
				return results;
			} catch (error) {
				throw mapToAppError(error);
			}
		},

		async create(data: any): Promise<T> {
			try {
				const result = await model.create({
					data,
				});
				if (!result) {
					throw new DatabaseError("Failed to create record");
				}
				return result;
			} catch (error) {
				throw mapToAppError(error);
			}
		},

		async update(id: string, data: any): Promise<T> {
			try {
				const existingRecord = await model.findUnique({
					where: { id },
				});

				if (!existingRecord) {
					throw new NotFoundError(`Record with id ${id} not found`);
				}

				const result = await model.update({
					where: { id },
					data,
				});

				if (!result) {
					throw new DatabaseError("Failed to update record");
				}

				return result;
			} catch (error) {
				throw mapToAppError(error);
			}
		},

		async delete(id: string): Promise<T> {
			try {
				const existingRecord = await model.findUnique({
					where: { id },
				});

				if (!existingRecord) {
					throw new NotFoundError(`Record with id ${id} not found`);
				}

				const result = await model.delete({
					where: { id },
				});

				if (!result) {
					throw new DatabaseError("Failed to delete record");
				}

				return result;
			} catch (error) {
				throw mapToAppError(error);
			}
		},
	};
}
