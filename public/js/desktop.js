const DESKTOP_ROBLOX_PLUGIN_URL = "https://create.roblox.com/store/asset/110405258188669/Forge-Codex";

function createRobloxPluginButton() {
	const button = document.createElement("a");
	button.id = "desktopRobloxPluginButton";
	button.className = "roblox-plugin-button";
	button.href = DESKTOP_ROBLOX_PLUGIN_URL;
	button.target = "_blank";
	button.rel = "noopener";
	button.textContent = "Plugin";
	return button;
}

function hideDesktopDownloadButton() {
	const downloadButton = document.getElementById("downloadAppButton");
	if (downloadButton) downloadButton.remove();
}

function openUpdateModal(payload = {}) {
	const modal = document.getElementById("updateModal");
	const title = document.getElementById("updateStatusText");
	const description = document.getElementById("updateStatusDescription");
	const subtitle = document.getElementById("updateModalSubtitle");
	const progress = document.getElementById("updateProgressBar");
	if (!modal || !title || !description || !progress) return;
	modal.classList.add("open");
	if (payload.status === "available") {
		title.textContent = `Cloud ${payload.version || "update"} is available`;
		description.textContent = "The app is downloading the newest build in the background.";
		if (subtitle) subtitle.textContent = "A newer version is being prepared.";
		progress.style.width = "8%";
	}
	if (payload.status === "downloading") {
		title.textContent = `Downloading update ${payload.percent || 0}%`;
		description.textContent = "Keep Cloud open while the update is downloaded.";
		progress.style.width = `${Math.max(4, Math.min(100, Number(payload.percent) || 0))}%`;
	}
	if (payload.status === "downloaded") {
		title.textContent = `Cloud ${payload.version || "update"} is ready`;
		description.textContent = "Restart Cloud when prompted to finish installing the update.";
		if (subtitle) subtitle.textContent = "Download complete.";
		progress.style.width = "100%";
	}
	if (payload.status === "error") {
		title.textContent = "Update check failed";
		description.textContent = payload.message || "Cloud could not check updates right now.";
		if (subtitle) subtitle.textContent = "Try again later.";
		progress.style.width = "0%";
	}
}

function closeUpdateModal() {
	const modal = document.getElementById("updateModal");
	if (modal) modal.classList.remove("open");
}

function createDesktopBadge(info, desktopApi) {
	const badge = document.createElement("button");
	badge.id = "desktopUpdateBadge";
	badge.className = "desktop-update-badge";
	badge.type = "button";
	badge.textContent = `App v${info.version}`;
	badge.title = "Check for Cloud app updates";
	badge.addEventListener("click", async () => {
		badge.textContent = "Checking update...";
		const result = await desktopApi.checkForUpdates();
		if (!result || !result.ok) {
			badge.textContent = result && result.error ? result.error : `App v${info.version}`;
			openUpdateModal({ status: "error", message: result && result.error ? result.error : "Update check failed." });
			setTimeout(() => { badge.textContent = `App v${info.version}`; }, 3200);
		}
	});
	return badge;
}

function setBadgeText(text) {
	const badge = document.getElementById("desktopUpdateBadge");
	if (badge) badge.textContent = text;
}

(async function bootDesktopIntegration() {
	const desktopApi = window.cloudDesktop || window.forgeDesktop;
	if (!desktopApi) return;

	hideDesktopDownloadButton();

	try {
		const closeButton = document.getElementById("closeUpdateModalButton");
		if (closeButton) closeButton.addEventListener("click", closeUpdateModal);
		const updateModal = document.getElementById("updateModal");
		if (updateModal) updateModal.addEventListener("click", event => { if (event.target === updateModal) closeUpdateModal(); });

		const info = await desktopApi.getAppInfo();
		const actions = document.querySelector(".title-actions");
		if (actions) {
			hideDesktopDownloadButton();
			actions.prepend(createDesktopBadge(info, desktopApi));
			if (!document.getElementById("desktopRobloxPluginButton") && !document.getElementById("robloxPluginButton")) {
				actions.insertBefore(createRobloxPluginButton(), actions.children[1] || null);
			}
		}

		if (desktopApi.setDiscordActivity) {
			desktopApi.setDiscordActivity({
				details: "Using Cloud",
				state: "Private IDE workspace",
			}).catch(() => {});
		}

		desktopApi.onUpdateStatus(payload => {
			if (!payload) return;
			if (payload.status === "checking") setBadgeText("Checking update...");
			if (payload.status === "available") { setBadgeText(`Downloading ${payload.version || "update"}...`); openUpdateModal(payload); }
			if (payload.status === "downloading") { setBadgeText(`Updating ${payload.percent || 0}%`); openUpdateModal(payload); }
			if (payload.status === "downloaded") { setBadgeText(`Update ${payload.version || "ready"} ready`); openUpdateModal(payload); }
			if (payload.status === "none") setBadgeText(`App v${info.version}`);
			if (payload.status === "error") {
				setBadgeText("Update check failed");
				openUpdateModal(payload);
				setTimeout(() => setBadgeText(`App v${info.version}`), 3000);
			}
		});
	} catch (error) {}
})();
