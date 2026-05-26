function normalizeText(value, fallback = "") {
	if (value === null || value === undefined) return fallback;
	return String(value).trim();
}

function sanitizeName(value) {
	return normalizeText(value, "").replace(/[\/\\\x00-\x1f]/g, "").trim().slice(0, 180);
}

function normalizeRelativePath(value) {
	return normalizeText(value, "")
		.replace(/\\/g, "/")
		.replace(/\.+/g, match => match.length > 1 ? "/" : ".")
		.split("/")
		.map(part => part.trim())
		.filter(Boolean)
		.join("/");
}

function pathToDisplayPath(root, relativePath) {
	const path = normalizeRelativePath(relativePath).replace(/\//g, ".");
	return path ? root + "." + path : root;
}

function getParentRelativePath(relativePath) {
	const parts = normalizeRelativePath(relativePath).split("/").filter(Boolean);
	parts.pop();
	return parts.join("/");
}

function getNameFromRelativePath(relativePath) {
	const parts = normalizeRelativePath(relativePath).split("/").filter(Boolean);
	return parts.length ? parts[parts.length - 1] : "";
}

function joinRelativePath(parent, name) {
	const cleanParent = normalizeRelativePath(parent);
	const cleanName = sanitizeName(name);
	return cleanParent ? cleanParent + "/" + cleanName : cleanName;
}

module.exports = {
	normalizeText,
	sanitizeName,
	normalizeRelativePath,
	pathToDisplayPath,
	getParentRelativePath,
	getNameFromRelativePath,
	joinRelativePath
};
