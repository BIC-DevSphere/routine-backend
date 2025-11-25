import axios from "axios";
import { logger } from "@/lib/logger";
import { EnvironmentError, ExternalServiceError } from "@/utils/errors";
import type { ExternalApiResponse } from "../types/externalApi.types";

export type RoutineExternalApiService = {
	getAuthToken(): Promise<string | undefined>;
	getRoutinesofDate(token: string, date: string): Promise<ExternalApiResponse>;
};

export function createRoutineExternalApiService(): RoutineExternalApiService {
	return {
		async getAuthToken(): Promise<string | undefined> {
			try {
				if (
					!process.env.EXTERNAL_API_USERNAME ||
					!process.env.EXTERNAL_API_PASSWORD
				) {
					throw new EnvironmentError(
						"EXTERNAL_API_USERNAME or EXTERNAL_API_PASSWORD",
					);
				}

				if (
					!process.env.EXTERNAL_API_ORIGIN ||
					!process.env.EXTERNAL_API_BASIC_AUTH ||
					!process.env.AUTH_BASE_URL
				) {
					throw new EnvironmentError(
						"EXTERNAL_API_ORIGIN or EXTERNAL_API_BASIC_AUTH or AUTH_BASE_URL",
					);
				}

				const params = new URLSearchParams({
					username: process.env.EXTERNAL_API_USERNAME || "",
					password: process.env.EXTERNAL_API_PASSWORD || "",
					grant_type: "password",
				});

				const response = await axios.post(process.env.AUTH_BASE_URL, params, {
					headers: {
						"Content-Type": "application/x-www-form-urlencoded",

						Origin: process.env.EXTERNAL_API_ORIGIN || "",
						Authorization: process.env.EXTERNAL_API_BASIC_AUTH || "",
					},
				});

				return response.data.access_token;
			} catch (error) {
				logger.error("Auth token fetch failed", {
					error: error instanceof Error ? error.message : error,
				});
				throw new ExternalServiceError("Routine API", "Token fetch failed");
			}
		},

		async getRoutinesofDate(
			token: string,
			date: string,
		): Promise<ExternalApiResponse> {
			try {
				if (
					!process.env.EXTERNAL_API_ORIGIN ||
					!process.env.EXTERNAL_API_BASIC_AUTH ||
					!process.env.ROUTINE_URL
				) {
					throw new EnvironmentError(
						"EXTERNAL_API_ORIGIN or EXTERNAL_API_BASIC_AUTH",
					);
				}
				console.log("Fetching routines for date:", date);
				const response = await axios.post(
					process.env.ROUTINE_URL,
					{
						teacherDto: { id: null },
						dateOf: date,
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
							Origin: process.env.EXTERNAL_API_ORIGIN || "",
						},
					},
				);

				if (!response.data || !Array.isArray(response.data.list)) {
					throw new ExternalServiceError(
						"Routine API",
						"Invalid or missing routine list",
					);
				}
				return response.data;
			} catch (error) {
				if (axios.isAxiosError(error) && error.response?.status === 401) {
					logger.error("Authentication failed - token expired", {
						status: error.response.status,
						date,
					});
					throw new ExternalServiceError(
						"Routine API",
						"Token expired - authentication failed",
					);
				}
				logger.error("Routines fetch failed", {
					error: error instanceof Error ? error.message : error,
				});
				throw new ExternalServiceError("Routine API", "Routines fetch failed");
			}
		},
	};
}

export const routineIntegrationServices = createRoutineExternalApiService();
