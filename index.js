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

		// Add filtering
		if (type) {
			query = query.eq("type", type);
		}
		if (search) {
			query = query.ilike("name", `%${search}%`);
		}

		// Add pagination
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

		// Validate ID is a number
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
			.ilike("name", `%${name}%`)
			.single();

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

app.post("/xtall", validateXtallInput, async (req, res) => {
	try {
		const { name, type, stat } = req.body;

		// Check if name already exists
		const { data: existing } = await supabase.from("xtall").select("id").eq("name", name).single();

		if (existing) {
			return res.status(409).json({
				success: false,
				message: "Name already exists",
			});
		}

		const { data, error } = await supabase
			.from("xtall")
			.insert([{ name, type, stat }])
			.select()
			.single();

		if (error) {
			return res.status(500).json({
				success: false,
				message: "Failed to create data",
				error: error.message,
			});
		}

		res.status(201).json({
			success: true,
			message: "Data created successfully",
			data: data,
		});
	} catch (err) {
		console.error("Error creating xtall:", err);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: err.message,
		});
	}
});
app.put("/xtall/:id", validateXtallInput, async (req, res) => {
	try {
		const { id } = req.params;
		const { name, type, stat } = req.body;

		// Validate ID
		if (isNaN(id)) {
			return res.status(400).json({
				success: false,
				message: "Invalid ID format",
			});
		}

		// Check if name already exists (excluding current record)
		const { data: existing } = await supabase
			.from("xtall")
			.select("id")
			.eq("name", name)
			.neq("id", id)
			.single();

		if (existing) {
			return res.status(409).json({
				success: false,
				message: "Name already exists",
			});
		}

		const { data, error } = await supabase
			.from("xtall")
			.update({ name, type, stat })
			.eq("id", id)
			.select()
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				return res.status(404).json({
					success: false,
					message: "Data not found",
				});
			}
			return res.status(500).json({
				success: false,
				message: "Failed to update data",
				error: error.message,
			});
		}

		res.json({
			success: true,
			message: "Data updated successfully",
			data: data,
		});
	} catch (err) {
		console.error("Error updating xtall:", err);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: err.message,
		});
	}
});

// Delete xtall record
app.delete("/xtall/:id", async (req, res) => {
	try {
		const { id } = req.params;

		// Validate ID
		if (isNaN(id)) {
			return res.status(400).json({
				success: false,
				message: "Invalid ID format",
			});
		}

		const { data, error } = await supabase.from("xtall").delete().eq("id", id).select().single();

		if (error) {
			if (error.code === "PGRST116") {
				return res.status(404).json({
					success: false,
					message: "Data not found",
				});
			}
			return res.status(500).json({
				success: false,
				message: "Failed to delete data",
				error: error.message,
			});
		}

		res.json({
			success: true,
			message: "Data deleted successfully",
			data: data,
		});
	} catch (err) {
		console.error("Error deleting xtall:", err);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: err.message,
		});
	}
});

// Global error handling middleware
app.use((err, req, res, next) => {
	console.error("Unhandled error:", err.stack);
	res.status(500).json({
		success: false,
		message: "Internal server error",
	});
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

// Graceful shutdown
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
