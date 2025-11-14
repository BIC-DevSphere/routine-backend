import type { NextFunction, Request, Response } from "express";
import { AppError } from "./errors";

export function errorHandler(
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			success: false,
			error: { code: err.code, message: err.message },
		});
	}
	console.error("Unexpected error:", err);
	res.status(500).json({
		success: false,
		error: {
			code: "INTERNAL_SERVER_ERROR",
			message: "An unexpected error occurred",
		},
	});
}
