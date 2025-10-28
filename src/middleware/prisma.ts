import { Prisma } from "@prisma/client";
import { DatabaseError, NotFoundError, ValidationError } from "../utils/errors";

const errorHandlingExtension = Prisma.defineExtension({
	name: "errorHandling",
	query: {
		async $allOperations({ args, query }) {
			return query(args).catch((error: any) => {
				if (error instanceof Prisma.PrismaClientKnownRequestError) {
					switch (error.code) {
						case "P2002":
							throw new ValidationError(
								"Duplicate value detected for a field which expects unique values.",
							);
						case "P2025":
							throw new NotFoundError(
								"The requested record was not found. " +
									"Perhaps it was already deleted or the criteria is incorrect.",
							);
						case "P2001":
							throw new NotFoundError(
								"No record matches the provided filter. " +
									`Model: ${error.meta?.modelName ?? "unknown"}`,
							);
						case "P2003":
							throw new ValidationError(
								"Foreign key constraint failed: an attempt was made to connect to a record that does not exist. " +
									`Field: ${error.meta?.field_name ?? "unknown"}`,
							);
						case "P2000":
							throw new ValidationError(
								"Value too long for the column type. " +
									`Column: ${error.meta?.column_name ?? "unknown"}`,
							);
						default:
							throw new DatabaseError(
								"An unexpected database error occurred. Please try again later.",
								error,
							);
					}
				}
				throw new DatabaseError("An internal database error occurred.", error);
			});
		},
	},
});
export default errorHandlingExtension;
