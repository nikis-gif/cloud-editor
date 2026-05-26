const { ROOT_ORDER, TRACKED_ROOTS, SCRIPT_CLASSES, FOLDER_CLASSES, CREATABLE_CLASSES, MAX_CHANGE_ENTRIES } = require("../constants");
const { hashString } = require("../utils/hash");
const {
	normalizeText,
	sanitizeName,
	normalizeRelativePath,
	pathToDisplayPath,
	getParentRelativePath,
	getNameFromRelativePath,
	joinRelativePath
} = require("../utils/path");

function isScriptClass(className) {
	return SCRIPT_CLASSES.has(className);
}

function isFolderClass(className) {
	return FOLDER_CLASSES.has(className);
}

function isCreatableClass(className) {
	return CREATABLE_CLASSES.has(className);
}

function generateItemId(root, relativePath, className) {
	return "ITEM-" + hashString(root + "|" + normalizeRelativePath(relativePath) + "|" + className + "|" + Date.now() + "|" + Math.random());
}

function itemHash(item) {
	return isScriptClass(item.className) ? hashString(item.source || "") : hashString(item.className + "|" + item.root + "|" + item.relativePath + "|" + (item.itemId || item.fileId));
}

function normalizeUploadedItems(body, previousSession) {
	const source = Array.isArray(body && body.items) ? body.items : Array.isArray(body && body.files) ? body.files : [];
	const protectedSources = previousSession && previousSession.protectedSources && typeof previousSession.protectedSources === "object" ? previousSession.protectedSources : {};
	const now = Date.now();
	for (const key of Object.keys(protectedSources)) {
		if (!protectedSources[key] || protectedSources[key].until <= now) delete protectedSources[key];
	}
	const items = [];
	const seen = new Set();
	for (const raw of source) {
		const className = normalizeText(raw && (raw.className || raw.ClassName), "");
		if (!isScriptClass(className) && !isFolderClass(className)) continue;
		const root = normalizeText(raw && (raw.root || raw.Root), "");
		if (!TRACKED_ROOTS.has(root)) continue;
		const relativePath = normalizeRelativePath(raw && (raw.relativePath || raw.path || raw.RelativePath));
		if (!relativePath) continue;
		const parentRelativePath = normalizeRelativePath(raw && (raw.parentRelativePath || raw.parentPath || raw.ParentRelativePath || getParentRelativePath(relativePath)));
		const name = sanitizeName(raw && (raw.name || raw.Name)) || getNameFromRelativePath(relativePath) || className;
		const itemId = normalizeText(raw && (raw.itemId || raw.fileId || raw.ItemId || raw.FileId), "") || generateItemId(root, relativePath, className);
		if (!itemId || seen.has(itemId)) continue;
		seen.add(itemId);
		const parentItemId = normalizeText(raw && (raw.parentItemId || raw.ParentItemId), "");
		const rawSource = isScriptClass(className) && typeof raw.source === "string" ? raw.source : "";
		let sourceText = rawSource;
		const protection = protectedSources[itemId];
		if (protection && protection.until > now && isScriptClass(className) && protection.sourceHash !== hashString(rawSource)) {
			sourceText = protection.source;
		} else if (protection && protection.sourceHash === hashString(rawSource)) {
			delete protectedSources[itemId];
		}
		const item = {
			fileId: itemId,
			itemId,
			parentItemId,
			name,
			className,
			kind: isScriptClass(className) ? "script" : "folder",
			root,
			relativePath,
			parentRelativePath,
			path: pathToDisplayPath(root, relativePath),
			instancePath: normalizeRelativePath(raw && (raw.instancePath || raw.actualPath || raw.InstancePath || relativePath)),
			source: sourceText,
			sourceLength: sourceText.length,
			sourceHash: normalizeText(raw && raw.sourceHash, "") || hashString(sourceText),
			updatedAt: Number.isFinite(Number(raw && raw.updatedAt)) ? Number(raw.updatedAt) : now
		};
		if (isScriptClass(className)) item.sourceHash = hashString(sourceText);
		items.push(item);
	}
	return { items, protectedSources };
}

function publicItem(item) {
	return {
		fileId: item.fileId,
		itemId: item.itemId || item.fileId,
		parentItemId: item.parentItemId || "",
		name: item.name,
		className: item.className,
		kind: item.kind || (isScriptClass(item.className) ? "script" : "folder"),
		root: item.root,
		relativePath: item.relativePath,
		parentRelativePath: item.parentRelativePath || getParentRelativePath(item.relativePath),
		path: item.path || pathToDisplayPath(item.root, item.relativePath),
		instancePath: item.instancePath || item.relativePath,
		sourceLength: typeof item.source === "string" ? item.source.length : 0,
		sourceHash: item.sourceHash || itemHash(item),
		updatedAt: item.updatedAt || null
	};
}

function getPublicItems(items) {
	return items.map(publicItem);
}

function findItem(sessionData, itemId) {
	return sessionData.items.find(item => item.fileId === itemId || item.itemId === itemId) || null;
}

function findItemByPath(sessionData, root, relativePath) {
	const normalized = normalizeRelativePath(relativePath);
	return sessionData.items.find(item => item.root === root && (item.relativePath === normalized || item.instancePath === normalized)) || null;
}

function assertValidParent(sessionData, root, parentRelativePath, parentItemId) {
	if (!TRACKED_ROOTS.has(root)) return { ok: false, error: "Unsupported root: " + root };
	if (!parentRelativePath && !parentItemId) return { ok: true, parent: null };
	const parent = parentItemId ? findItem(sessionData, parentItemId) : findItemByPath(sessionData, root, parentRelativePath);
	if (!parent) return { ok: false, error: "Parent folder does not exist in the current Cloud tree." };
	if (!isFolderClass(parent.className)) return { ok: false, error: "Parent item must be a folder." };
	return { ok: true, parent };
}

function pushChange(sessionData, change) {
	const revision = sessionData.nextRevision;
	sessionData.nextRevision += 1;
	const payload = { revision, createdAt: Date.now(), acknowledged: false, ...change };
	sessionData.changes.push(payload);
	if (sessionData.changes.length > MAX_CHANGE_ENTRIES) sessionData.changes.splice(0, sessionData.changes.length - Math.floor(MAX_CHANGE_ENTRIES * 0.65));
	return payload;
}

function createLocalItem({ className, name, root, parentRelativePath, parentItemId, source }) {
	const relativePath = joinRelativePath(parentRelativePath, name);
	const itemId = generateItemId(root, relativePath, className);
	const sourceText = isScriptClass(className) && typeof source === "string" ? source : "";
	return {
		fileId: itemId,
		itemId,
		parentItemId: parentItemId || "",
		name,
		className,
		kind: isScriptClass(className) ? "script" : "folder",
		root,
		relativePath,
		parentRelativePath: normalizeRelativePath(parentRelativePath),
		path: pathToDisplayPath(root, relativePath),
		instancePath: relativePath,
		source: sourceText,
		sourceLength: sourceText.length,
		sourceHash: hashString(sourceText),
		updatedAt: Date.now()
	};
}

function getChildren(sessionData, parentItemId) {
	return sessionData.items.filter(item => (item.parentItemId || "") === (parentItemId || ""));
}

function isDescendantOf(sessionData, item, ancestorItemId) {
	let cursor = item;
	const visited = new Set();
	while (cursor && cursor.parentItemId) {
		if (cursor.parentItemId === ancestorItemId) return true;
		if (visited.has(cursor.parentItemId)) return false;
		visited.add(cursor.parentItemId);
		cursor = findItem(sessionData, cursor.parentItemId);
	}
	return false;
}

function updateDescendantPaths(sessionData, parent) {
	for (const child of getChildren(sessionData, parent.fileId)) {
		child.root = parent.root;
		child.parentRelativePath = parent.relativePath;
		child.relativePath = joinRelativePath(parent.relativePath, child.name);
		child.path = pathToDisplayPath(child.root, child.relativePath);
		if (!child.instancePath || child.instancePath === child.relativePath) child.instancePath = child.relativePath;
		child.updatedAt = Date.now();
		updateDescendantPaths(sessionData, child);
	}
}

function removeItemAndDescendants(sessionData, item) {
	const removed = [];
	const ids = new Set([item.fileId]);
	let changed = true;
	while (changed) {
		changed = false;
		for (const candidate of sessionData.items) {
			if (!ids.has(candidate.fileId) && ids.has(candidate.parentItemId)) {
				ids.add(candidate.fileId);
				changed = true;
			}
		}
	}
	sessionData.items = sessionData.items.filter(candidate => {
		if (!ids.has(candidate.fileId)) return true;
		removed.push(candidate);
		return false;
	});
	sessionData.files = sessionData.items;
	sessionData.filesCount = sessionData.items.length;
	return removed;
}

module.exports = {
	ROOT_ORDER,
	isScriptClass,
	isFolderClass,
	isCreatableClass,
	normalizeUploadedItems,
	getPublicItems,
	publicItem,
	findItem,
	findItemByPath,
	assertValidParent,
	pushChange,
	createLocalItem,
	updateDescendantPaths,
	isDescendantOf,
	removeItemAndDescendants
};
