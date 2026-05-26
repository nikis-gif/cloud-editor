const { contextBridge, ipcRenderer } = require("electron");

const desktopApi = {
	getAppInfo: () => ipcRenderer.invoke("cloud:get-app-info"),
	checkForUpdates: () => ipcRenderer.invoke("cloud:check-for-updates"),
	setDiscordActivity: activity => ipcRenderer.invoke("cloud:set-discord-activity", activity),
	onUpdateStatus: callback => {
		const listener = (_event, payload) => callback(payload);
		ipcRenderer.on("cloud:update-status", listener);
		return () => ipcRenderer.removeListener("cloud:update-status", listener);
	},
};

contextBridge.exposeInMainWorld("cloudDesktop", desktopApi);
contextBridge.exposeInMainWorld("forgeDesktop", desktopApi);
