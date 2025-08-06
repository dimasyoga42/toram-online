import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
export const supabase = createClient(
	"https://dpzomyklvfwauezwmdja.supabase.co",
	process.env.APIKEY
);
