export class AppError extends Error {
	public statusCode: number;
	public code?: string;
	public isOperational: boolean;

	constructor(
		message: string,
		statusCode = 500,
		code?: string,
		isOperational = true,
	) {
		super(message);
		this.statusCode = statusCode;
		this.code = code;
		this.isOperational = isOperational;
	}
}

export class ValidationError extends AppError {
	constructor(message: string) {
		super(message, 400, "VALIDATION_ERROR");
	}
}

export class DatabaseError extends AppError {
	constructor(message: string, originalError?: any) {
		super(message, 500, "DATABASE_ERROR");
		this.stack = originalError?.stack || this.stack;
	}
}

export class NotFoundError extends AppError {
	constructor(resource: string) {
		super(`${resource} not found`, 404, "NOT_FOUND");
	}
}

export class ExternalServiceError extends AppError {
	constructor(service: string, message: string) {
		super(`${service} error: ${message}`, 502, "EXTERNAL_SERVICE_ERROR");
	}
}

export function mapToAppError(err: unknown): AppError {
	if (err instanceof AppError) {
		return err;
	}
	if (err instanceof Error) {
		return new AppError(err.message, 500, "INTERNAL_SERVER_ERROR");
	}

	if (err && typeof err === "object") {
		const errorObj = err as any;

		if ("message" in errorObj) {
			const statusCode =
				"statusCode" in errorObj && typeof errorObj.statusCode === "number"
					? errorObj.statusCode
					: 500;
			const code =
				"code" in errorObj && typeof errorObj.code === "string"
					? errorObj.code
					: "INTERNAL_SERVER_ERROR";

			return new AppError(errorObj.message, statusCode, code);
		}
	}

	return new AppError(
		"An unexpected error occurred",
		500,
		"INTERNAL_SERVER_ERROR",
	);
}
