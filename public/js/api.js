<<<<<<< HEAD
(function () {
	function getStoredSession() {
		return {
			sessionId: localStorage.getItem("cloud.sessionId") || "",
			secret: localStorage.getItem("cloud.secret") || ""
		};
	}

	function setStoredSession(sessionId, secret) {
		localStorage.setItem("cloud.sessionId", sessionId || "");
		localStorage.setItem("cloud.secret", secret || "");
	}

	function clearStoredSession() {
		localStorage.removeItem("cloud.sessionId");
		localStorage.removeItem("cloud.secret");
	}

	function headers(session) {
		return {
			"Content-Type": "application/json",
			"X-Cloud-Session": session.sessionId || "",
			"X-Cloud-Secret": session.secret || ""
		};
	}

	async function request(method, path, body, session) {
		const options = { method, headers: headers(session || getStoredSession()) };
		if (body !== undefined && body !== null) options.body = JSON.stringify(body);
		const response = await fetch(path, options);
		const text = await response.text();
		let data = null;
		if (text) {
			try {
				data = JSON.parse(text);
			} catch (error) {
				throw new Error("Invalid JSON response.");
			}
		}
		if (!response.ok || data && data.ok === false) {
			throw new Error(data && data.error ? data.error : "Request failed.");
		}
		return data || { ok: true };
	}

	window.CloudApi = {
		getStoredSession,
		setStoredSession,
		clearStoredSession,
		health: () => request("GET", "/health", null, {}),
		files: sessionId => request("GET", "/sessions/" + encodeURIComponent(sessionId) + "/files"),
		source: (sessionId, fileId) => request("GET", "/sessions/" + encodeURIComponent(sessionId) + "/files/" + encodeURIComponent(fileId) + "/source"),
		save: (sessionId, fileId, source) => request("POST", "/sessions/" + encodeURIComponent(sessionId) + "/files/" + encodeURIComponent(fileId) + "/save", { source }),
		create: (sessionId, body) => request("POST", "/sessions/" + encodeURIComponent(sessionId) + "/create", body),
		move: (sessionId, fileId, body) => request("POST", "/sessions/" + encodeURIComponent(sessionId) + "/files/" + encodeURIComponent(fileId) + "/move", body),
		delete: (sessionId, fileId) => request("POST", "/sessions/" + encodeURIComponent(sessionId) + "/files/" + encodeURIComponent(fileId) + "/delete", {}),
		search: (sessionId, query) => request("GET", "/sessions/" + encodeURIComponent(sessionId) + "/search?q=" + encodeURIComponent(query || "")),
		output: (sessionId, after) => request("GET", "/sessions/" + encodeURIComponent(sessionId) + "/output?after=" + encodeURIComponent(after || 0) + "&limit=250"),
		clearOutput: sessionId => request("DELETE", "/sessions/" + encodeURIComponent(sessionId) + "/output")
	};
}());
=======
function buildHeaders(auth, extra = {}) {
	const headers = {
		"Content-Type": "application/json",
		...extra,
	};

	if (auth && auth.sessionId) {
		headers["X-Cloud-Session"] = auth.sessionId;
	}

	if (auth && auth.secret) {
		headers["X-Cloud-Secret"] = auth.secret;
	}

	return headers;
}

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestJson(url, options = {}, auth = null, attempt = 1) {
	try {
		const response = await fetch(url, {
			...options,
			headers: buildHeaders(auth, options.headers || {}),
		});

		const data = await response.json().catch(() => ({ ok: false, error: "Invalid server response." }));

		if (!response.ok || !data.ok) {
			const error = new Error(data.error || "Request failed.");
			error.status = response.status;
			error.payload = data;
			throw error;
		}

		return data;
	} catch (error) {
		const canRetry = attempt < 2 && (!error.status || error.status >= 500);
		if (!canRetry) throw error;
		await wait(260 * attempt);
		return requestJson(url, options, auth, attempt + 1);
	}
}

export function fetchSessionFiles(auth) {
	return requestJson(`/sessions/${encodeURIComponent(auth.sessionId)}/files`, {}, auth);
}

export function fetchSource(auth, fileId) {
	return requestJson(`/sessions/${encodeURIComponent(auth.sessionId)}/files/${encodeURIComponent(fileId)}/source`, {}, auth);
}

export function saveSource(auth, fileId, source, baseSourceHash) {
	return requestJson(`/sessions/${encodeURIComponent(auth.sessionId)}/files/${encodeURIComponent(fileId)}/save`, {
		method: "POST",
		body: JSON.stringify({ source, baseSourceHash }),
	}, auth);
}

export function createRemoteItem(auth, payload) {
	return requestJson(`/sessions/${encodeURIComponent(auth.sessionId)}/create`, {
		method: "POST",
		body: JSON.stringify(payload),
	}, auth);
}

export function moveRemoteItem(auth, fileId, payload) {
	return requestJson(`/sessions/${encodeURIComponent(auth.sessionId)}/files/${encodeURIComponent(fileId)}/move`, {
		method: "POST",
		body: JSON.stringify(payload),
	}, auth);
}

export function deleteRemoteItem(auth, fileId) {
	return requestJson(`/sessions/${encodeURIComponent(auth.sessionId)}/files/${encodeURIComponent(fileId)}/delete`, {
		method: "POST",
		body: JSON.stringify({}),
	}, auth);
}

export function fetchOutputLogs(auth, after = 0, limit = 200) {
	const sessionId = encodeURIComponent(auth.sessionId);
	const query = new URLSearchParams({ after: String(after || 0), limit: String(limit || 200) });
	return requestJson(`/sessions/${sessionId}/output?${query.toString()}`, {}, auth);
}

export function clearOutputLogs(auth) {
	return requestJson(`/sessions/${encodeURIComponent(auth.sessionId)}/output`, {
		method: "DELETE",
	}, auth);
}
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
