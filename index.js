import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import { validateXtallInput } from "./src/middleware/validation.js";
import xtall from "./src/routes/routes.main.js";
import regist from "./src/routes/routes.regist.js";

dotenv.config();

const supabase = createClient(process.env.LINKDATABASE, process.env.APIKEY);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/", xtall);
app.use("/", regist);

app.use((err, req, res, next) => {
	console.error("Unhandled error:", err.stack);
	res.status(500).json({
		success: false,
		message: "Internal server error",
	});
});

app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

process.on("SIGTERM", () => {
	console.log("SIGTERM received, shutting down gracefully");
	process.exit(0);
});

process.on("SIGINT", () => {
	console.log("SIGINT received, shutting down gracefully");
	process.exit(0);
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Server running on port: ${PORT}`);
	console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
