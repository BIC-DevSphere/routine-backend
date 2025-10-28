import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

const app = express();

dotenv.config();
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "",
		methods: ["GET", "POST", "OPTIONS"],
	}),
);

app.use(express.json());
app.use(morgan("dev"));
app.get("/", (_req, res) => {
	res.status(200).send("OK");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
