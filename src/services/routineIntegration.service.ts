import axios from "axios";
import { EnvironmentError, ExternalServiceError } from "@/utils/errors";
import type { ExternalApiResponse } from "../types/externalApi.types";

export type RoutineExternalApiService = {
	getAuthToken(): Promise<string | undefined>;
	getRoutinesofDate(
		token: string,
		date: string,
	): Promise<ExternalApiResponse | undefined>;
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
					!process.env.EXTERNAL_API_BASIC_AUTH
				) {
					throw new EnvironmentError(
						"EXTERNAL_API_ORIGIN or EXTERNAL_API_BASIC_AUTH",
					);
				}

				const params = new URLSearchParams({
					username: process.env.EXTERNAL_API_USERNAME || "",
					password: process.env.EXTERNAL_API_PASSWORD || "",
					grant_type: "password",
				});

				const response = await axios.post(
					`${process.env.AUTH_BASE_URL}?${params.toString()}`,
					{},
					{
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",

							Origin: process.env.EXTERNAL_API_ORIGIN || "",
							Authorization: process.env.EXTERNAL_API_BASIC_AUTH || "",
						},
					},
				);
				console.log(response.data.access_token);
				return response.data.access_token;
			} catch (error) {
				console.error("Error fetching auth token:", error);
				throw new ExternalServiceError("Routine API", "Token fetch failed");
			}
		},

		async getRoutinesofDate(
			token: string,
			date: string,
		): Promise<ExternalApiResponse | undefined> {
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
				return response.data;
			} catch (error) {
				console.error("Error fetching routines:", error);
				throw new ExternalServiceError("Routine API", "Routines fetch failed");
			}
		},
	};
}

export const routineIntegrationServices = createRoutineExternalApiService();
