import express from "express";
import { supabase } from "../db/db.js";

const item = express.Router();

item.get("/item", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from("item")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch data",
        error: error.message,
      });
    }

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

item.get("/item/search/:name", async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Nama item wajib diisi"
      });
    }

    const { data, error } = await supabase
      .from("item")
      .select("*")
      .ilike("nama", `%${name}%`);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Gagal mengambil data item",
        error: error.message
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      total: data.length,
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server"
    });
  }
});
export default item;
