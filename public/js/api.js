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
