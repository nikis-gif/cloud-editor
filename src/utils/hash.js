function hashString(value) {
<<<<<<< HEAD
	const text = String(value || "");
	let hash = 5381;
	for (let index = 0; index < text.length; index += 1) {
		hash = ((hash * 33) + text.charCodeAt(index)) >>> 0;
	}
	return hash.toString(16).padStart(8, "0").toUpperCase();
=======
	let hash = 5381;
	const text = String(value || "");

	for (let index = 0; index < text.length; index += 1) {
		hash = ((hash * 33) + text.charCodeAt(index)) >>> 0;
	}

	return hash.toString(16).toUpperCase().padStart(8, "0");
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
}

module.exports = { hashString };
