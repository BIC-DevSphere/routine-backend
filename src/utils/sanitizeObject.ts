export function sanitizeUpdateObject<T extends object>(
	updates: T,
): Partial<T> | null {
	if (!updates || Object.keys(updates).length === 0) {
		return null;
	}
	const cleanedData = Object.fromEntries(
		Object.entries(updates).filter(([_, v]) => v != null && v !== undefined),
	);
	if (Object.keys(cleanedData).length === 0) {
		return null;
	}
	return cleanedData as Partial<T>;
}
