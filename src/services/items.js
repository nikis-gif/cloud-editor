<<<<<<< HEAD
const { ROOT_ORDER, TRACKED_ROOTS, SCRIPT_CLASSES, FOLDER_CLASSES, CREATABLE_CLASSES, MAX_CHANGE_ENTRIES } = require("../constants");
=======
const {
	ROOT_ORDER,
	TRACKED_ROOTS,
	SCRIPT_CLASSES,
	FOLDER_CLASSES,
} = require("../constants");
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
const { hashString } = require("../utils/hash");
const {
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
} = require("../utils/path");

function isScriptClass(className) {
	return SCRIPT_CLASSES.has(className);
}

function isFolderClass(className) {
	return FOLDER_CLASSES.has(className);
}

<<<<<<< HEAD
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
=======
function generateItemId(root, relativePath, className) {
	return "ITEM-" + hashString(`${root}|${normalizeRelativePath(relativePath)}|${className}|${Date.now()}|${Math.random()}`);
}

function getItemHash(file) {
	if (isScriptClass(file.className)) {
		return hashString(file.source || "");
	}

	return hashString(`${file.className}|${file.itemId || file.fileId}|${file.root}|${file.relativePath}`);
}

function normalizeUploadedFiles(files) {
	return files
		.map(file => {
			const className = normalizeText(file.className, "Instance");
			const root = normalizeText(file.root, "");
			const relativePath = normalizeRelativePath(file.relativePath);
			const name = sanitizeName(file.name) || getNameFromRelativePath(relativePath) || className;
			const source = isScriptClass(className) && typeof file.source === "string" ? file.source : "";
			const itemId = normalizeText(file.itemId || file.fileId, "") || generateItemId(root, relativePath, className);
			const parentItemId = normalizeText(file.parentItemId || file.ParentItemId, "");
			const parentRelativePath = normalizeRelativePath(file.parentRelativePath || getParentRelativePath(relativePath));
			const kind = isScriptClass(className) ? "script" : (isFolderClass(className) ? "folder" : "instance");

			return {
				fileId: itemId,
				itemId,
				parentItemId,
				name,
				className,
				kind,
				root,
				relativePath,
				parentRelativePath,
				source,
				sourceLength: source.length,
				sourceHash: normalizeText(file.sourceHash, "") || hashString(isScriptClass(className) ? source : `${className}|${itemId}|${root}|${relativePath}`),
				updatedAt: Date.now(),
			};
		})
		.filter(file => file.root && TRACKED_ROOTS.has(file.root) && file.relativePath && file.itemId);
}

function getPublicFiles(files) {
	return files.map(file => ({
		fileId: file.fileId,
		itemId: file.itemId || file.fileId,
		parentItemId: file.parentItemId || "",
		name: file.name,
		className: file.className,
		kind: file.kind || (isScriptClass(file.className) ? "script" : (isFolderClass(file.className) ? "folder" : "instance")),
		root: file.root,
		relativePath: file.relativePath,
		parentRelativePath: normalizeRelativePath(file.parentRelativePath || getParentRelativePath(file.relativePath)),
		sourceLength: typeof file.source === "string" ? file.source.length : 0,
		sourceHash: file.sourceHash || getItemHash(file),
		updatedAt: file.updatedAt || null,
	}));
}

function findItem(sessionData, itemId) {
	return sessionData.files.find(file => file.fileId === itemId || file.itemId === itemId) || null;
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
}

function findItemByPath(sessionData, root, relativePath) {
	const normalized = normalizeRelativePath(relativePath);
<<<<<<< HEAD
	return sessionData.items.find(item => item.root === root && (item.relativePath === normalized || item.instancePath === normalized)) || null;
}

function assertValidParent(sessionData, root, parentRelativePath, parentItemId) {
	if (!TRACKED_ROOTS.has(root)) return { ok: false, error: "Unsupported root: " + root };
	if (!parentRelativePath && !parentItemId) return { ok: true, parent: null };
	const parent = parentItemId ? findItem(sessionData, parentItemId) : findItemByPath(sessionData, root, parentRelativePath);
	if (!parent) return { ok: false, error: "Parent folder does not exist in the current Cloud tree." };
	if (!isFolderClass(parent.className)) return { ok: false, error: "Parent item must be a folder." };
=======
	return sessionData.files.find(file => file.root === root && file.relativePath === normalized) || null;
}

function findParentByPath(sessionData, root, parentRelativePath) {
	const normalized = normalizeRelativePath(parentRelativePath);

	if (!normalized) {
		return null;
	}

	return findItemByPath(sessionData, root, normalized);
}

function getParentItem(sessionData, root, parentRelativePath, parentItemId) {
	if (parentItemId) {
		const byId = findItem(sessionData, parentItemId);

		if (byId) {
			return byId;
		}
	}

	return findParentByPath(sessionData, root, parentRelativePath);
}

function assertValidParent(sessionData, root, parentRelativePath, parentItemId) {
	if (!TRACKED_ROOTS.has(root)) {
		return { ok: false, error: "Unsupported root: " + root };
	}

	if (!parentRelativePath && !parentItemId) {
		return { ok: true, parent: null };
	}

	const parent = getParentItem(sessionData, root, parentRelativePath, parentItemId);

	if (!parent) {
		return { ok: false, error: "Parent instance does not exist in the current Cloud tree." };
	}

>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
	return { ok: true, parent };
}

function pushChange(sessionData, change) {
	const revision = sessionData.nextRevision;
	sessionData.nextRevision += 1;
<<<<<<< HEAD
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
=======

	const payload = {
		revision,
		createdAt: Date.now(),
		...change,
	};

	sessionData.changes.push(payload);

	if (sessionData.changes.length > 1500) {
		sessionData.changes = sessionData.changes.slice(-900);
	}

	return payload;
}

function getChildrenByParentId(sessionData, parentItemId) {
	return sessionData.files.filter(file => (file.parentItemId || "") === (parentItemId || ""));
}

function collectItemAndDescendants(sessionData, item) {
	const removed = [];
	const visited = new Set();
	const queue = [item];
	const oldPrefix = item.relativePath ? item.relativePath + "/" : "";

	while (queue.length > 0) {
		const current = queue.shift();

		if (!current || visited.has(current.fileId)) {
			continue;
		}

		visited.add(current.fileId);
		removed.push(current);

		for (const child of getChildrenByParentId(sessionData, current.fileId)) {
			queue.push(child);
		}
	}

	for (const file of sessionData.files) {
		if (visited.has(file.fileId)) {
			continue;
		}

		if (file.root === item.root && oldPrefix && file.relativePath.startsWith(oldPrefix)) {
			visited.add(file.fileId);
			removed.push(file);
		}
	}

	return { removed, ids: visited };
}

function removeItemAndDescendants(sessionData, item) {
	const collected = collectItemAndDescendants(sessionData, item);
	sessionData.files = sessionData.files.filter(file => !collected.ids.has(file.fileId));
	sessionData.filesCount = sessionData.files.length;
	return collected.removed;
}

function updateDescendantPaths(sessionData, parentItem) {
	const children = getChildrenByParentId(sessionData, parentItem.fileId);

	for (const child of children) {
		child.root = parentItem.root;
		child.parentRelativePath = parentItem.relativePath;
		child.relativePath = joinRelativePath(parentItem.relativePath, child.name);
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
		child.updatedAt = Date.now();
		updateDescendantPaths(sessionData, child);
	}
}

<<<<<<< HEAD
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
=======
function isDescendantOf(sessionData, item, ancestorItemId) {
	let cursor = item;
	const visited = new Set();

	while (cursor && cursor.parentItemId) {
		if (cursor.parentItemId === ancestorItemId) {
			return true;
		}

		if (visited.has(cursor.parentItemId)) {
			return false;
		}

		visited.add(cursor.parentItemId);
		cursor = findItem(sessionData, cursor.parentItemId);
	}

	return false;
}

function createLocalItem({ className, name, root, parentRelativePath, parentItemId, source }) {
	const relativePath = joinRelativePath(parentRelativePath, name);
	const itemId = generateItemId(root, relativePath, className);
	const itemSource = isScriptClass(className) && typeof source === "string" ? source : "";

	return {
		fileId: itemId,
		itemId,
		parentItemId,
		name,
		className,
		kind: isScriptClass(className) ? "script" : (isFolderClass(className) ? "folder" : "instance"),
		root,
		relativePath,
		parentRelativePath,
		source: itemSource,
		sourceLength: itemSource.length,
		sourceHash: hashString(isScriptClass(className) ? itemSource : `${className}|${itemId}|${root}|${relativePath}`),
		updatedAt: Date.now(),
	};
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
}

module.exports = {
	ROOT_ORDER,
	isScriptClass,
<<<<<<< HEAD
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
=======
	normalizeUploadedFiles,
	getPublicFiles,
	findItem,
	assertValidParent,
	pushChange,
	removeItemAndDescendants,
	updateDescendantPaths,
	isDescendantOf,
	createLocalItem,
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
};
