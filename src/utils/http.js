const fs = require("fs");
const path = require("path");
const { MAX_BODY_SIZE, PUBLIC_DIR } = require("../constants");

<<<<<<< HEAD
const CONTENT_TYPES = {
=======
const MIME_TYPES = {
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "application/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
<<<<<<< HEAD
	".ico": "image/x-icon",
	".svg": "image/svg+xml; charset=utf-8",
	".txt": "text/plain; charset=utf-8"
};

function setCors(res) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type,X-Cloud-Session,X-Cloud-Secret,X-Forge-Session,X-Forge-Secret,X-StudioBridge-Session,X-StudioBridge-Secret");
	res.setHeader("Access-Control-Max-Age", "86400");
}

function sendOptions(res) {
	setCors(res);
	res.writeHead(204);
	res.end();
}

function sendJson(res, statusCode, payload) {
	setCors(res);
	res.writeHead(statusCode, {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-store"
	});
	res.end(JSON.stringify(payload));
}

function readBody(req) {
	return new Promise((resolve, reject) => {
		let size = 0;
		const chunks = [];
		req.on("data", chunk => {
			size += chunk.length;
			if (size > MAX_BODY_SIZE) {
				reject(new Error("Request body is too large."));
				req.destroy();
				return;
			}
			chunks.push(chunk);
		});
		req.on("end", () => {
			const text = Buffer.concat(chunks).toString("utf8");
			if (!text) {
				resolve(null);
				return;
			}
			try {
				resolve(JSON.parse(text));
			} catch (error) {
				reject(new Error("Invalid JSON body."));
			}
		});
		req.on("error", reject);
	});
}

function getHeader(req, name) {
	const value = req.headers[String(name).toLowerCase()];
	return Array.isArray(value) ? value[0] : value || "";
}

function getSessionHeaders(req) {
	return {
		sessionId: String(getHeader(req, "x-cloud-session") || getHeader(req, "x-forge-session") || getHeader(req, "x-studiobridge-session") || "").trim(),
		secret: String(getHeader(req, "x-cloud-secret") || getHeader(req, "x-forge-secret") || getHeader(req, "x-studiobridge-secret") || "").trim()
	};
}

function sendStaticFile(res, requestPath) {
	setCors(res);
	const cleanPath = decodeURIComponent(String(requestPath || "/").split("?")[0]);
	const relativePath = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
	const fullPath = path.resolve(PUBLIC_DIR, relativePath);
	if (!fullPath.startsWith(PUBLIC_DIR)) {
=======
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".svg": "image/svg+xml; charset=utf-8",
	".ico": "image/x-icon",
};

function writeCorsHeaders(res, statusCode = 200, extraHeaders = {}) {
	res.writeHead(statusCode, {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, X-Cloud-Session, X-Cloud-Secret, X-Forge-Session, X-Forge-Secret, X-StudioBridge-Session, X-StudioBridge-Secret",
		...extraHeaders,
	});
}

function sendOptions(res) {
	writeCorsHeaders(res, 204);
	res.end();
}

function sendJson(res, statusCode, data) {
	const body = JSON.stringify(data);

	writeCorsHeaders(res, statusCode, {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-store",
	});

	res.end(body);
}

function sendStaticFile(res, requestPath) {
	const publicDir = path.resolve(PUBLIC_DIR);
	const cleanRequestPath = requestPath === "/" ? "/index.html" : requestPath;
	let decodedPath = "/index.html";

	try {
		decodedPath = decodeURIComponent(cleanRequestPath);
	} catch (error) {
		res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("Invalid URL");
		return;
	}

	const filePath = path.resolve(publicDir, decodedPath.replace(/^\/+/, ""));

	if (filePath !== publicDir && !filePath.startsWith(publicDir + path.sep)) {
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
		res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("Forbidden");
		return;
	}
<<<<<<< HEAD
	fs.readFile(fullPath, (error, data) => {
		if (error) {
			const fallback = path.join(PUBLIC_DIR, "index.html");
			fs.readFile(fallback, (fallbackError, fallbackData) => {
				if (fallbackError) {
					res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
					res.end("Not found");
					return;
				}
				res.writeHead(200, { "Content-Type": CONTENT_TYPES[".html"], "Cache-Control": "no-cache" });
				res.end(fallbackData);
			});
			return;
		}
		const ext = path.extname(fullPath).toLowerCase();
		res.writeHead(200, { "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream", "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400" });
=======

	fs.readFile(filePath, (error, data) => {
		if (error) {
			res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
			res.end("Not found");
			return;
		}

		const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
		res.writeHead(200, {
			"Content-Type": type,
			"Cache-Control": "no-store",
		});
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
		res.end(data);
	});
}

<<<<<<< HEAD
=======
function readBody(req) {
	return new Promise((resolve, reject) => {
		let body = "";
		let tooLarge = false;

		req.on("data", chunk => {
			body += chunk;

			if (body.length > MAX_BODY_SIZE) {
				tooLarge = true;
				req.destroy();
				reject(new Error("Request body too large"));
			}
		});

		req.on("end", () => {
			if (tooLarge) {
				return;
			}

			if (!body) {
				resolve(null);
				return;
			}

			try {
				resolve(JSON.parse(body));
			} catch (error) {
				reject(new Error("Invalid JSON body"));
			}
		});

		req.on("error", reject);
	});
}

function getSessionHeaders(req) {
	return {
		sessionId: String(req.headers["x-cloud-session"] || req.headers["x-forge-session"] || req.headers["x-studiobridge-session"] || "").trim(),
		secret: String(req.headers["x-cloud-secret"] || req.headers["x-forge-secret"] || req.headers["x-studiobridge-secret"] || "").trim(),
	};
}

>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
module.exports = {
	sendOptions,
	sendJson,
	sendStaticFile,
	readBody,
<<<<<<< HEAD
	getSessionHeaders
=======
	getSessionHeaders,
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
};
