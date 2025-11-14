import {
	Body,
	Button,
	Container,
	Head,
	Html,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import * as React from "react";

export function ResetPasswordEmail({
	name,
	link,
}: {
	name: string;
	link: string;
}) {
	return (
		<Html>
			<Head />
			<Preview>Reset your password — {name}</Preview>
			<Body style={main}>
				<Container style={container}>
					<Text style={title}>👋 Hey {name},</Text>
					<Text style={text}>
						We received a request to reset your password. Click the button below
						to set up a new one. If you didn’t request this, you can safely
						ignore this email.
					</Text>

					<Section style={{ textAlign: "center", marginTop: "30px" }}>
						<Button style={button} href={link}>
							Reset Password
						</Button>
					</Section>

					<Text style={footer}>
						This link will expire in 15 minutes.
						<br />
						Stay secure 💙
					</Text>
				</Container>
			</Body>
		</Html>
	);
}

const main = {
	backgroundColor: "#f6f9fc",
	fontFamily: "Inter, Arial, sans-serif",
	padding: "40px 0",
};

const container = {
	backgroundColor: "#ffffff",
	borderRadius: "8px",
	padding: "40px",
	maxWidth: "500px",
	margin: "0 auto",
	boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
};

const title = {
	fontSize: "20px",
	fontWeight: "600",
	color: "#222",
};

const text = {
	fontSize: "14px",
	color: "#444",
	lineHeight: "1.6",
};

const button = {
	backgroundColor: "#0070f3",
	color: "#fff",
	padding: "12px 24px",
	borderRadius: "6px",
	textDecoration: "none",
	fontWeight: "600",
};

const footer = {
	fontSize: "12px",
	color: "#777",
	marginTop: "40px",
	textAlign: "center" as const,
};
