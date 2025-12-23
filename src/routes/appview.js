import express from "express"
import { supabase } from "../db/db.js";
const appview = express.Router()

appview.get("/appview/search/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const { error, data } = await supabase.from("appview").select("*").ilike("name", `%${name}%`)
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch data",
        error: error.message,
      });
    }
    res.json({
      status: 200,
      data: data
    })
  } catch (err) {

  }
})

export default appview;
