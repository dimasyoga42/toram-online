export const validateXtallInput = (req, res, next) => {
	const { name, type, stat } = req.body;

	if (!name || typeof name !== "string" || name.trim().length === 0) {
		return res.status(400).json({
			success: false,
			message: "Name is required and must be a non-empty string",
		});
	}

	if (!type || typeof type !== "string" || type.trim().length === 0) {
		return res.status(400).json({
			success: false,
			message: "Type is required and must be a non-empty string",
		});
	}

	if (stat === undefined || stat === null || typeof stat !== "number") {
		return res.status(400).json({
			success: false,
			message: "Stat is required and must be a number",
		});
	}

	// Trim strings
	req.body.name = name.trim();
	req.body.type = type.trim();

	next();
};
