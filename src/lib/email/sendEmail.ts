import { render } from "@react-email/render";
import { createElement } from "react";
import { AppError, mapToAppError } from "@/utils/errors";
import transporter from ".";
import emailTemplates from "./templates";

interface EmailDTO {
	to: string;
	subject: string;
	type: "EMAIL_VERIFY" | "RESET_PASSWORD";
	name: string;
	link: string;
}
export default async function sendEmail({
	to,
	subject,
	type,
	name,
	link,
}: EmailDTO) {
	try {
		const template = getTemplate(type);
		const html = await render(createElement(template, { name, link }));
		const mailOptions = {
			from: `Routine <${process.env.EMAIL}>`,
			to,
			subject,
			html,
		};
		const result = await transporter.sendMail(mailOptions);

		if (result.rejected.length > 0) {
			throw new AppError(
				"Failed to send email",
				500,
				"INTERNAL_SERVER_ERROR",
				true,
			);
		}

		return result;
	} catch (error) {
		console.log("Error while sending email: ", error);
		const mappedError = mapToAppError(error);
		throw new AppError(mappedError.message, 500, "INTERNAL_SERVER_ERROR", true);
	}
}

const getTemplate = (type: EmailDTO["type"]) => {
	switch (type) {
		case "EMAIL_VERIFY":
			return emailTemplates.EmailVerification;
		case "RESET_PASSWORD":
			return emailTemplates.ResetPasswordEmail;
	}
};
