import type { Response } from "express";
import type { AppError } from "@/utils/errors";

export abstract class BaseController {
	protected sendSuccess(
		res: Response,
		data: any,
		message: string,
		status = 200,
	) {
		res.status(status).json({ success: true, message, data });
	}

	protected sendError(res: Response, error: AppError) {
		res.status(error.statusCode).json({
			success: false,
			error: {
				code: error.code || "INTERNAL_SERVER_ERROR",
				message: error.message || "something went wrong",
			},
		});
	}
}
