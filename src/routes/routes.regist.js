import express from "express";
import { supabase } from "../db/db.js";

const regist = express.Router();

regist.get("/regist", async (req, res) => {
	try {
		const { page = 1, limit = 10, type, search } = req.query;
		const offset = (page - 1) * limit;

		let query = supabase.from("regist").select("*", { count: "exact" });

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

regist.get("/regist/name/:name", async (req, res) => {
	try {
		const { name } = req.params;

		const { data, error } = await supabase.from("regist").select("*").ilike("name", `%${name}%`);

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

		return res.json({
			success: true,
			data,
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: err.message,
		});
	}
});

export default regist;
