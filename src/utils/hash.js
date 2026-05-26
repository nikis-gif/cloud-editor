function hashString(value) {
	const text = String(value || "");
	let hash = 5381;
	for (let index = 0; index < text.length; index += 1) {
		hash = ((hash * 33) + text.charCodeAt(index)) >>> 0;
	}
	return hash.toString(16).padStart(8, "0").toUpperCase();
}

module.exports = { hashString };
