const sessions = new Map();

function getSession(sessionId) {
	return sessions.get(String(sessionId || "")) || null;
}

function setSession(sessionId, data) {
	sessions.set(String(sessionId || ""), data);
	return data;
}

module.exports = { getSession, setSession };
