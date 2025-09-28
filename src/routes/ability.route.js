import express from "express";
import { supabase } from "../db/db.js";


const ability = express.Router()



ability.get("/ability/name/:name",async (req, res) => {
try {
    const { name } = req.params;

    const { data, error } = await supabase
      .from("ability")
      .select("*")
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
    console.log(data)

    res.json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error("Error fetching ability by name:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
})




export default ability
