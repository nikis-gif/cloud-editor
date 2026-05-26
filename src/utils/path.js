function normalizeText(value, fallback = "") {
<<<<<<< HEAD
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
=======
	return typeof value === "string" ? value : fallback;
}

function sanitizeName(name) {
	const value = String(name || "").trim();
	return value ? value.replace(/[\\/\0]/g, "-").slice(0, 80) : "";
}

function normalizeRelativePath(relativePath) {
	return String(relativePath || "")
		.replace(/\\/g, "/")
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
		.split("/")
		.map(part => part.trim())
		.filter(Boolean)
		.join("/");
}

<<<<<<< HEAD
function pathToDisplayPath(root, relativePath) {
	const path = normalizeRelativePath(relativePath).replace(/\//g, ".");
	return path ? root + "." + path : root;
}

function getParentRelativePath(relativePath) {
	const parts = normalizeRelativePath(relativePath).split("/").filter(Boolean);
=======
function getParentRelativePath(relativePath) {
	const normalized = normalizeRelativePath(relativePath);

	if (!normalized) {
		return "";
	}

	const parts = normalized.split("/");
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
	parts.pop();
	return parts.join("/");
}

function getNameFromRelativePath(relativePath) {
<<<<<<< HEAD
	const parts = normalizeRelativePath(relativePath).split("/").filter(Boolean);
	return parts.length ? parts[parts.length - 1] : "";
}

function joinRelativePath(parent, name) {
	const cleanParent = normalizeRelativePath(parent);
	const cleanName = sanitizeName(name);
	return cleanParent ? cleanParent + "/" + cleanName : cleanName;
=======
	const normalized = normalizeRelativePath(relativePath);

	if (!normalized) {
		return "";
	}

	const parts = normalized.split("/");
	return parts[parts.length - 1] || "";
}

function joinRelativePath(parentRelativePath, name) {
	const parent = normalizeRelativePath(parentRelativePath);
	const cleanName = sanitizeName(name);
	return parent ? `${parent}/${cleanName}` : cleanName;
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
}

module.exports = {
	normalizeText,
	sanitizeName,
	normalizeRelativePath,
<<<<<<< HEAD
	pathToDisplayPath,
	getParentRelativePath,
	getNameFromRelativePath,
	joinRelativePath
=======
	getParentRelativePath,
	getNameFromRelativePath,
	joinRelativePath,
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
};
