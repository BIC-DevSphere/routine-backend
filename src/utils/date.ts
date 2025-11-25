export const generateWeekDates = (startDate: string): string[] => {
	const dates: string[] = [];
	const start = new Date(startDate);
	for (let i = 0; i < 7; i++) {
		const currentDate = new Date(start);
		currentDate.setDate(start.getDate() + i);
		if (currentDate.getDay() === 6) {
			console.log("[Sync] Skipping Saturday:", currentDate.toISOString());
			continue;
		}
		// Format to ISO string (e.g., "2025-11-10T00:00:00Z")
		dates.push(currentDate.toISOString());
	}

	return dates;
};
