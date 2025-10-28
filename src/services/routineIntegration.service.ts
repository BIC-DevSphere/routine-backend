import axios from "axios";

class RoutineExternalApiService {
	async getAuthToken(): Promise<string | undefined> {
		try {
			if (
				!process.env.EXTERNAL_API_USERNAME ||
				!process.env.EXTERNAL_API_PASSWORD
			) {
				throw new Error(
					"Missing EXTERNAL_API_USERNAME or EXTERNAL_API_PASSWORD in environment variables",
				);
			}

			if (
				!process.env.EXTERNAL_API_ORIGIN ||
				!process.env.EXTERNAL_API_BASIC_AUTH
			) {
				throw new Error(
					"Missing EXTERNAL_API_ORIGIN or EXTERNAL_API_BASIC_AUTH in environment variables",
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
		}
	}

	async getRoutinesofDate(token: string, date: string): Promise<unknown> {
		try {
			if (
				!process.env.EXTERNAL_API_ORIGIN ||
				!process.env.EXTERNAL_API_BASIC_AUTH ||
				!process.env.ROUTINE_URL
			) {
				throw new Error(
					"Missing EXTERNAL_API_ORIGIN or EXTERNAL_API_BASIC_AUTH or ROUTINE_URL in environment variables",
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
			//   console.log(response.data);
			return response.data;
		} catch (error) {
			console.error("Error fetching routines:", error);
		}
	}
}

export const routineIntegrationServices = new RoutineExternalApiService();
