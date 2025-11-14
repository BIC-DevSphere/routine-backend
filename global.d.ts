import { SuccessResponse } from "./src/dtos/SuccessResponse";
import { ErrorResponse } from "./src/dtos/ErrorResponse";

declare global {
	namespace Express {
		interface Response {
			success: <T = any>(
				payload: ConstructorParameters<typeof SuccessResponse<T>>[0],
			) => void;
			error: <D = any>(
				payload: ConstructorParameters<typeof ErrorResponse<D>>[0],
			) => void;
		}
		interface Request {
			userId?: string;
			groupId?: string;
		}
	}
}
