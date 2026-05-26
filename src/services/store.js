const sessions = new Map();

function getSession(sessionId) {
<<<<<<< HEAD
	return sessions.get(String(sessionId || "")) || null;
}

function setSession(sessionId, data) {
	sessions.set(String(sessionId || ""), data);
	return data;
}

module.exports = { getSession, setSession };
=======
	return sessions.get(sessionId) || null;
}

function setSession(sessionId, sessionData) {
	sessions.set(sessionId, sessionData);
	return sessionData;
}

module.exports = {
	getSession,
	setSession,
};
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
