import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import { validateXtallInput } from "./src/middleware/validation.js";

dotenv.config();

const supabase = createClient(process.env.LINKDATABASE, process.env.APIKEY);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/xtall", async (req, res) => {
	try {
		const { page = 1, limit = 10, type, search } = req.query;
		const offset = (page - 1) * limit;

		let query = supabase.from("xtall").select("*", { count: "exact" });

		if (type) {
			query = query.eq("type", type);
		}
		if (search) {
			query = query.ilike("name", `%${search}%`);
		}

		query = query.range(offset, offset + limit - 1);

		const { data, error, count } = await query;

		if (error) {
			return res.status(500).json({
				success: false,
				message: "Failed to fetch data",
				error: error.message,
			});
		}

		res.json({
			success: true,
			data: data,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total: count,
				totalPages: Math.ceil(count / limit),
			},
		});
	} catch (err) {
		console.error("Error fetching xtall data:", err);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: err.message,
		});
	}
});

app.get("/xtall/:id", async (req, res) => {
	try {
		const { id } = req.params;

		if (isNaN(id)) {
			return res.status(400).json({
				success: false,
				message: "Invalid ID format",
			});
		}

		const { data, error } = await supabase.from("xtall").select().eq("id", id).single();

		if (error) {
			if (error.code === "PGRST116") {
				return res.status(404).json({
					success: false,
					message: "Data not found",
				});
			}
			return res.status(500).json({
				success: false,
				message: "Database error",
				error: error.message,
			});
		}

		res.json({
			success: true,
			data: data,
		});
	} catch (err) {
		console.error("Error fetching xtall by ID:", err);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: err.message,
		});
	}
});

app.get("/xtall/name/:name", async (req, res) => {
	try {
		const { name } = req.params;

		const { data, error } = await supabase
			.from("xtall")
			.select("name, type, upgrade, stat")
			.ilike("name", `%${name}%`);

		if (error) {
			if (error.code === "PGRST116") {
				return res.status(404).json({
					success: false,
					message: "Data not found",
				});
			}
			return res.status(500).json({
				success: false,
				message: "Database error",
				error: error.message,
			});
		}

		res.json({
			success: true,
			data: data,
		});
	} catch (err) {
		console.error("Error fetching xtall by name:", err);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: err.message,
		});
	}
});

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
