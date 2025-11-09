import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { BaseController } from "@/controllers/base";
import { auth } from "@/lib/auth";
import { AppError } from "@/utils/errors";

export class AuthMiddleware extends BaseController {
	constructor() {
		super();
		this.authenticate = this.authenticate.bind(this);
	}

	public async authenticate(req: Request, res: Response, next: NextFunction) {
		try {
			const headers = fromNodeHeaders(req.headers);
			const session = await auth.api.getSession({ headers });

			if (session) {
				req.userId = session.user.id;
				req.groupId = session.user.groupId;
				next();
			} else {
				const error = new AppError("Unauthorized", 401, "UNAUTHORIZED");
				this.sendError(res, error);
			}
		} catch (error) {
			console.log("Something went wrong on auth middleware: ", error);
			const appError = new AppError(
				"Internal Server Error",
				500,
				"INTERNAL_SERVER_ERROR",
			);
			this.sendError(res, appError);
		}
	}

	public async isAdmin(req: Request, res: Response, next: NextFunction) {
		try {
			const headers = fromNodeHeaders(req.headers);
			const session = await auth.api.getSession({ headers });

			if (session && session.user.role === "ADMIN") {
				next();
			} else {
				const error = new AppError("Forbidden", 403, "FORBIDDEN");
				this.sendError(res, error);
			}
		} catch (error) {
			console.log("Something went wrong on isAdmin middleware: ", error);
			const appError = new AppError(
				"Internal Server Error",
				500,
				"INTERNAL_SERVER_ERROR",
			);
			this.sendError(res, appError);
		}
	}
}

export const authMiddleware = new AuthMiddleware();
