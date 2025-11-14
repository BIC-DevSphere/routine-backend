import { Html, Text } from "@react-email/components";
import React from "react";

export function EmailVerification({
	name,
	link,
}: {
	name: string;
	link: string;
}) {
	return (
		<Html>
			<Text>Hello {name},</Text>
			<Text>Click below to verify your account:</Text>
			<a href={link}>Verify Account</a>
		</Html>
	);
}
