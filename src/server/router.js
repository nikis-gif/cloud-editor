const { ROOT_ORDER, MAX_OUTPUT_ENTRIES } = require("../constants");
const { hashString } = require("../utils/hash");
const { sendOptions, sendJson, sendStaticFile, readBody, getSessionHeaders } = require("../utils/http");
const { normalizeText, sanitizeName, normalizeRelativePath, getParentRelativePath, joinRelativePath } = require("../utils/path");
const { getSession, setSession } = require("../services/store");
const {
	isScriptClass,
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
} = require("../services/items");

function getLastRevision(sessionData) {
	return Array.isArray(sessionData.changes) && sessionData.changes.length ? sessionData.changes[sessionData.changes.length - 1].revision : 0;
}

function getAuthorizedSession(req, res, sessionId) {
	const sessionData = getSession(sessionId);
	if (!sessionData) {
		sendJson(res, 404, { ok: false, error: "Session not found.", sessionId });
		return null;
	}
	const headers = getSessionHeaders(req);
	if (!headers.secret) {
		sendJson(res, 401, { ok: false, error: "Missing session secret." });
		return null;
	}
	if (sessionData.secret && sessionData.secret !== headers.secret) {
		sendJson(res, 403, { ok: false, error: "Invalid session secret." });
		return null;
	}
	if (headers.sessionId && headers.sessionId !== sessionId) {
		sendJson(res, 403, { ok: false, error: "Session header does not match route session." });
		return null;
	}
	return sessionData;
}

async function handleSessionUpload(req, res) {
	const headers = getSessionHeaders(req);
	const body = await readBody(req);
	if (!headers.sessionId) {
		sendJson(res, 400, { ok: false, error: "Missing session header." });
		return;
	}
	if (!headers.secret) {
		sendJson(res, 400, { ok: false, error: "Missing secret header." });
		return;
	}
	const previous = getSession(headers.sessionId);
	if (previous && previous.secret && previous.secret !== headers.secret) {
		sendJson(res, 403, { ok: false, error: "Invalid session secret." });
		return;
	}
	const normalized = normalizeUploadedItems(body || {}, previous);
	const sessionData = {
		sessionId: headers.sessionId,
		secret: headers.secret,
		uploadedAt: Date.now(),
		projectHash: normalizeText(body && body.projectHash, ""),
		items: normalized.items,
		files: normalized.items,
		filesCount: normalized.items.length,
		output: previous && Array.isArray(previous.output) ? previous.output : [],
		nextOutputId: previous && Number.isFinite(previous.nextOutputId) ? previous.nextOutputId : 1,
		changes: previous && Array.isArray(previous.changes) ? previous.changes : [],
		nextRevision: previous && Number.isFinite(previous.nextRevision) ? previous.nextRevision : 1,
		protectedSources: normalized.protectedSources
	};
	setSession(headers.sessionId, sessionData);
	sendJson(res, 200, {
		ok: true,
		sessionId: headers.sessionId,
		itemsCount: sessionData.items.length,
		filesCount: sessionData.items.length,
		uploadedAt: sessionData.uploadedAt,
		lastRevision: getLastRevision(sessionData),
		projectHash: sessionData.projectHash
	});
}

function sendSessionFiles(req, res, sessionId) {
	const sessionData = getAuthorizedSession(req, res, sessionId);
	if (!sessionData) return;
	sendJson(res, 200, {
		ok: true,
		sessionId,
		rootOrder: ROOT_ORDER,
		itemsCount: sessionData.items.length,
		filesCount: sessionData.items.length,
		uploadedAt: sessionData.uploadedAt,
		lastRevision: getLastRevision(sessionData),
		projectHash: sessionData.projectHash || "",
		items: getPublicItems(sessionData.items),
		files: getPublicItems(sessionData.items)
	});
}

function sendSource(req, res, sessionId, fileId) {
	const sessionData = getAuthorizedSession(req, res, sessionId);
	if (!sessionData) return;
	const item = findItem(sessionData, fileId);
	if (!item) {
		sendJson(res, 404, { ok: false, error: "Script not found.", fileId });
		return;
	}
	if (!isScriptClass(item.className)) {
		sendJson(res, 400, { ok: false, error: "Selected item is not a script." });
		return;
	}
	sendJson(res, 200, {
		ok: true,
		sessionId,
		fileId: item.fileId,
		itemId: item.itemId || item.fileId,
		name: item.name,
		className: item.className,
		root: item.root,
		relativePath: item.relativePath,
		instancePath: item.instancePath || item.relativePath,
		path: item.path,
		source: item.source || "",
		sourceLength: typeof item.source === "string" ? item.source.length : 0,
		sourceHash: hashString(item.source || "")
	});
}

async function saveSource(req, res, sessionId, fileId) {
	const sessionData = getAuthorizedSession(req, res, sessionId);
	if (!sessionData) return;
	const body = await readBody(req);
	if (!body || typeof body.source !== "string") {
		sendJson(res, 400, { ok: false, error: "Invalid save body. Expected source string." });
		return;
	}
	const item = findItem(sessionData, fileId);
	if (!item) {
		sendJson(res, 404, { ok: false, error: "Script not found.", fileId });
		return;
	}
	if (!isScriptClass(item.className)) {
		sendJson(res, 400, { ok: false, error: "Cannot save a non-script item." });
		return;
	}
	item.source = body.source;
	item.sourceLength = body.source.length;
	item.sourceHash = hashString(body.source);
	item.updatedAt = Date.now();
	sessionData.protectedSources = sessionData.protectedSources && typeof sessionData.protectedSources === "object" ? sessionData.protectedSources : {};
	sessionData.protectedSources[item.fileId] = {
		source: item.source,
		sourceHash: item.sourceHash,
		updatedAt: item.updatedAt,
		until: Date.now() + 45000
	};
	const change = pushChange(sessionData, {
		type: "updateSource",
		fileId: item.fileId,
		itemId: item.itemId || item.fileId,
		root: item.root,
		relativePath: item.relativePath,
		instancePath: item.instancePath || item.relativePath,
		source: item.source,
		sourceHash: item.sourceHash
	});
	sendJson(res, 200, {
		ok: true,
		sessionId,
		fileId: item.fileId,
		itemId: item.itemId || item.fileId,
		revision: change.revision,
		acknowledged: false,
		sourceHash: item.sourceHash,
		sourceLength: item.sourceLength
	});
}

async function createItem(req, res, sessionId) {
	const sessionData = getAuthorizedSession(req, res, sessionId);
	if (!sessionData) return;
	const body = await readBody(req);
	const className = normalizeText(body && body.className, "Script");
	const name = sanitizeName(body && body.name);
	const root = normalizeText(body && body.root, "ServerScriptService");
	const parentRelativePath = normalizeRelativePath(body && body.parentRelativePath);
	const parentItemId = normalizeText(body && body.parentItemId, "");
	if (!isCreatableClass(className)) {
		sendJson(res, 400, { ok: false, error: "Unsupported class: " + className });
		return;
	}
	if (!name) {
		sendJson(res, 400, { ok: false, error: "Name is required." });
		return;
	}
	const parentCheck = assertValidParent(sessionData, root, parentRelativePath, parentItemId);
	if (!parentCheck.ok) {
		sendJson(res, 400, { ok: false, error: parentCheck.error });
		return;
	}
	const item = createLocalItem({ className, name, root, parentRelativePath, parentItemId, source: typeof body.source === "string" ? body.source : "" });
	sessionData.items.push(item);
	sessionData.files = sessionData.items;
	sessionData.filesCount = sessionData.items.length;
	const change = pushChange(sessionData, {
		type: "createInstance",
		fileId: item.fileId,
		itemId: item.itemId,
		name: item.name,
		className: item.className,
		kind: item.kind,
		root: item.root,
		relativePath: item.relativePath,
		parentRelativePath: item.parentRelativePath,
		parentItemId: item.parentItemId,
		source: item.source,
		sourceHash: item.sourceHash
	});
	sendJson(res, 200, { ok: true, sessionId, item: publicItem(item), revision: change.revision });
}

async function moveItem(req, res, sessionId, fileId) {
	const sessionData = getAuthorizedSession(req, res, sessionId);
	if (!sessionData) return;
	const item = findItem(sessionData, fileId);
	if (!item) {
		sendJson(res, 404, { ok: false, error: "Item not found.", fileId });
		return;
	}
	const body = await readBody(req);
	const root = normalizeText(body && body.root, item.root);
	const parentRelativePath = normalizeRelativePath(body && body.parentRelativePath);
	const parentItemId = normalizeText(body && body.parentItemId, "");
	const name = sanitizeName(body && body.name) || item.name;
	const parentCheck = assertValidParent(sessionData, root, parentRelativePath, parentItemId);
	if (!parentCheck.ok) {
		sendJson(res, 400, { ok: false, error: parentCheck.error });
		return;
	}
	let cursor = parentItemId ? findItem(sessionData, parentItemId) : null;
	while (cursor) {
		if (cursor.fileId === item.fileId) {
			sendJson(res, 400, { ok: false, error: "Cannot move an item inside itself." });
			return;
		}
		cursor = cursor.parentItemId ? findItem(sessionData, cursor.parentItemId) : null;
	}
	const oldRoot = item.root;
	const oldPath = item.relativePath;
	item.root = root;
	item.name = name;
	item.parentItemId = parentItemId;
	item.parentRelativePath = parentRelativePath;
	item.relativePath = joinRelativePath(parentRelativePath, name);
	item.path = root + "." + item.relativePath.replace(/\//g, ".");
	item.updatedAt = Date.now();
	updateDescendantPaths(sessionData, item);
	const moved = sessionData.items.filter(candidate => candidate.fileId === item.fileId || isDescendantOf(sessionData, candidate, item.fileId));
	const change = pushChange(sessionData, {
		type: "moveInstance",
		fileId: item.fileId,
		itemId: item.itemId || item.fileId,
		name: item.name,
		className: item.className,
		fromRoot: oldRoot,
		fromRelativePath: oldPath,
		root: item.root,
		relativePath: item.relativePath,
		parentRelativePath: item.parentRelativePath,
		parentItemId: item.parentItemId
	});
	sendJson(res, 200, { ok: true, sessionId, item: publicItem(item), moved: getPublicItems(moved), revision: change.revision });
}

async function deleteItem(req, res, sessionId, fileId) {
	const sessionData = getAuthorizedSession(req, res, sessionId);
	if (!sessionData) return;
	const item = findItem(sessionData, fileId);
	if (!item) {
		sendJson(res, 404, { ok: false, error: "Item not found.", fileId });
		return;
	}
	const removed = removeItemAndDescendants(sessionData, item);
	const change = pushChange(sessionData, {
		type: "deleteInstance",
		fileId: item.fileId,
		itemId: item.itemId || item.fileId,
		name: item.name,
		className: item.className,
		root: item.root,
		relativePath: item.relativePath,
		removed: getPublicItems(removed)
	});
	sendJson(res, 200, { ok: true, sessionId, removed: getPublicItems(removed), revision: change.revision });
}

function sendChanges(req, res, sessionId, url) {
	const sessionData = getAuthorizedSession(req, res, sessionId);
	if (!sessionData) return;
	const after = Number(url.searchParams.get("after") || "0");
	if (!Number.isFinite(after) || after < 0) {
		sendJson(res, 400, { ok: false, error: "Invalid revision." });
		return;
	}
	const changes = sessionData.changes.filter(change => change.revision > after);
	sendJson(res, 200, { ok: true, sessionId, after, lastRevision: getLastRevision(sessionData), changesCount: changes.length, changes });
}

async function acknowledgeChanges(req, res, sessionId) {
	const sessionData = getAuthorizedSession(req, res, sessionId);
	if (!sessionData) return;
	const body = await readBody(req);
	const acknowledgements = Array.isArray(body && body.acks) ? body.acks : Array.isArray(body && body.revisions) ? body.revisions.map(revision => ({ revision, ok: true })) : body && body.revision ? [{ revision: body.revision, ok: body.ok !== false, error: body.error || "" }] : [];
	const updated = [];
	for (const ack of acknowledgements) {
		const revision = Number(ack.revision);
		if (!Number.isFinite(revision)) continue;
		const change = sessionData.changes.find(candidate => candidate.revision === revision);
		if (!change) continue;
		change.acknowledged = ack.ok !== false;
		change.acknowledgedAt = Date.now();
		change.error = ack.ok === false ? normalizeText(ack.error, "Apply failed.") : "";
		updated.push({ revision, ok: change.acknowledged, error: change.error });
	}
	sendJson(res, 200, { ok: true, sessionId, acknowledged: updated });
}

function normalizeOutputEntry(raw, id) {
	const value = raw && typeof raw === "object" ? raw : {};
	const level = normalizeText(value.level || value.messageType || "info", "info").toLowerCase();
	const normalizedLevel = ["error", "warn", "warning", "print", "output", "info"].includes(level) ? level : "info";
	const message = normalizeText(value.message, "").slice(0, 20000);
	const stackTrace = normalizeText(value.stackTrace, "").slice(0, 30000);
	const root = normalizeText(value.root, "");
	const relativePath = normalizeRelativePath(value.relativePath || value.path || "");
	const scriptPath = normalizeText(value.scriptPath || value.fullPath || "", "").slice(0, 1000);
	return {
		id,
		createdAt: Number.isFinite(Number(value.createdAt)) ? Number(value.createdAt) : Date.now(),
		clock: normalizeText(value.clock, ""),
		level: normalizedLevel === "warning" ? "warn" : normalizedLevel === "output" ? "print" : normalizedLevel,
		message,
		stackTrace,
		source: normalizeText(value.source, "").slice(0, 80),
		player: normalizeText(value.player, "").slice(0, 120),
		scriptName: normalizeText(value.scriptName, "").slice(0, 240),
		scriptPath,
		root,
		relativePath,
		itemId: normalizeText(value.itemId || value.fileId, ""),
		line: Number.isFinite(Number(value.line)) ? Number(value.line) : null,
		column: Number.isFinite(Number(value.column)) ? Number(value.column) : null,
		sourcePreview: normalizeText(value.sourcePreview || value.preview, "").slice(0, 30000)
	};
}

async function appendOutput(req, res, sessionId) {
	const sessionData = getAuthorizedSession(req, res, sessionId);
	if (!sessionData) return;
	const body = await readBody(req);
	const entries = Array.isArray(body && body.entries) ? body.entries : body && typeof body === "object" ? [body] : [];
	if (!entries.length) {
		sendJson(res, 400, { ok: false, error: "Invalid output body." });
		return;
	}
	sessionData.output = Array.isArray(sessionData.output) ? sessionData.output : [];
	sessionData.nextOutputId = Number.isFinite(sessionData.nextOutputId) ? sessionData.nextOutputId : 1;
	let added = 0;
	for (const raw of entries.slice(0, 150)) {
		const entry = normalizeOutputEntry(raw, sessionData.nextOutputId++);
		if (!entry.message && !entry.stackTrace) continue;
		sessionData.output.push(entry);
		added += 1;
	}
	if (sessionData.output.length > MAX_OUTPUT_ENTRIES) sessionData.output.splice(0, sessionData.output.length - MAX_OUTPUT_ENTRIES);
	sendJson(res, 200, { ok: true, sessionId, addedCount: added, lastOutputId: sessionData.nextOutputId - 1 });
}

function sendOutput(req, res, sessionId, url) {
	const sessionData = getAuthorizedSession(req, res, sessionId);
	if (!sessionData) return;
	const after = Number(url.searchParams.get("after") || "0");
	const limit = Math.max(1, Math.min(500, Number(url.searchParams.get("limit") || "200")));
	const output = Array.isArray(sessionData.output) ? sessionData.output : [];
	const entries = output.filter(entry => Number(entry.id) > after).slice(-limit);
	const lastOutputId = output.length ? Number(output[output.length - 1].id) || 0 : 0;
	sendJson(res, 200, { ok: true, sessionId, after, lastOutputId, entriesCount: entries.length, entries });
}

function clearOutput(req, res, sessionId) {
	const sessionData = getAuthorizedSession(req, res, sessionId);
	if (!sessionData) return;
	sessionData.output = [];
	sessionData.nextOutputId = 1;
	sendJson(res, 200, { ok: true, sessionId, cleared: true });
}

function searchCode(req, res, sessionId, url) {
	const sessionData = getAuthorizedSession(req, res, sessionId);
	if (!sessionData) return;
	const query = normalizeText(url.searchParams.get("q"), "");
	const limit = Math.max(1, Math.min(600, Number(url.searchParams.get("limit") || "300")));
	if (!query) {
		sendJson(res, 200, { ok: true, sessionId, query, results: [] });
		return;
	}
	const lower = query.toLowerCase();
	const results = [];
	for (const item of sessionData.items) {
		if (!isScriptClass(item.className)) continue;
		const searchableName = [item.name, item.path, item.relativePath, item.instancePath].join(" ").toLowerCase();
		if (searchableName.includes(lower)) {
			results.push({ fileId: item.fileId, itemId: item.itemId || item.fileId, name: item.name, path: item.path, line: 1, column: 1, preview: item.path });
		}
		const lines = String(item.source || "").split(/\r?\n/);
		for (let index = 0; index < lines.length; index += 1) {
			const line = lines[index];
			const column = line.toLowerCase().indexOf(lower);
			if (column >= 0) {
				results.push({ fileId: item.fileId, itemId: item.itemId || item.fileId, name: item.name, path: item.path, line: index + 1, column: column + 1, preview: line.trim().slice(0, 240) });
				if (results.length >= limit) break;
			}
		}
		if (results.length >= limit) break;
	}
	sendJson(res, 200, { ok: true, sessionId, query, count: results.length, results });
}

async function handleRequest(req, res) {
	try {
		if (req.method === "OPTIONS") {
			sendOptions(res);
			return;
		}
		const url = new URL(req.url, "http://localhost");
		if (req.method === "GET" && url.pathname === "/health") {
			sendJson(res, 200, { ok: true, service: "Cloud API", version: "2.0.0", time: Date.now() });
			return;
		}
		if (req.method === "POST" && url.pathname === "/sessions/upload") {
			await handleSessionUpload(req, res);
			return;
		}
		const filesMatch = url.pathname.match(/^\/sessions\/([^/]+)\/files$/);
		if (req.method === "GET" && filesMatch) {
			sendSessionFiles(req, res, decodeURIComponent(filesMatch[1]));
			return;
		}
		const sourceMatch = url.pathname.match(/^\/sessions\/([^/]+)\/files\/([^/]+)\/source$/);
		if (sourceMatch && req.method === "GET") {
			sendSource(req, res, decodeURIComponent(sourceMatch[1]), decodeURIComponent(sourceMatch[2]));
			return;
		}
		const saveMatch = url.pathname.match(/^\/sessions\/([^/]+)\/files\/([^/]+)\/save$/);
		if (saveMatch && req.method === "POST") {
			await saveSource(req, res, decodeURIComponent(saveMatch[1]), decodeURIComponent(saveMatch[2]));
			return;
		}
		const createMatch = url.pathname.match(/^\/sessions\/([^/]+)\/create$/);
		if (createMatch && req.method === "POST") {
			await createItem(req, res, decodeURIComponent(createMatch[1]));
			return;
		}
		const moveMatch = url.pathname.match(/^\/sessions\/([^/]+)\/files\/([^/]+)\/move$/);
		if (moveMatch && req.method === "POST") {
			await moveItem(req, res, decodeURIComponent(moveMatch[1]), decodeURIComponent(moveMatch[2]));
			return;
		}
		const deleteMatch = url.pathname.match(/^\/sessions\/([^/]+)\/files\/([^/]+)\/delete$/);
		if (deleteMatch && req.method === "POST") {
			await deleteItem(req, res, decodeURIComponent(deleteMatch[1]), decodeURIComponent(deleteMatch[2]));
			return;
		}
		const changesMatch = url.pathname.match(/^\/sessions\/([^/]+)\/changes$/);
		if (changesMatch && req.method === "GET") {
			sendChanges(req, res, decodeURIComponent(changesMatch[1]), url);
			return;
		}
		const ackMatch = url.pathname.match(/^\/sessions\/([^/]+)\/acks$/);
		if (ackMatch && req.method === "POST") {
			await acknowledgeChanges(req, res, decodeURIComponent(ackMatch[1]));
			return;
		}
		const outputMatch = url.pathname.match(/^\/sessions\/([^/]+)\/output$/);
		if (outputMatch && req.method === "POST") {
			await appendOutput(req, res, decodeURIComponent(outputMatch[1]));
			return;
		}
		if (outputMatch && req.method === "GET") {
			sendOutput(req, res, decodeURIComponent(outputMatch[1]), url);
			return;
		}
		if (outputMatch && req.method === "DELETE") {
			clearOutput(req, res, decodeURIComponent(outputMatch[1]));
			return;
		}
		const searchMatch = url.pathname.match(/^\/sessions\/([^/]+)\/search$/);
		if (searchMatch && req.method === "GET") {
			searchCode(req, res, decodeURIComponent(searchMatch[1]), url);
			return;
		}
		if (req.method === "GET" && !url.pathname.startsWith("/sessions")) {
			sendStaticFile(res, url.pathname);
			return;
		}
		sendJson(res, 404, { ok: false, error: "Route not found.", method: req.method, path: url.pathname });
	} catch (error) {
		sendJson(res, 500, { ok: false, error: error && error.message ? error.message : "Internal server error." });
	}
}

module.exports = { handleRequest };
