(function () {
	const api = window.CloudApi;
	const editorTools = window.CloudEditor;
	const refs = {
		sessionGate: document.getElementById("sessionGate"),
		workbench: document.getElementById("workbench"),
		loginForm: document.getElementById("loginForm"),
		sessionInput: document.getElementById("sessionInput"),
		secretInput: document.getElementById("secretInput"),
		loginMessage: document.getElementById("loginMessage"),
		treeRoot: document.getElementById("treeRoot"),
		tabs: document.getElementById("tabs"),
		editorHost: document.getElementById("editorHost"),
		emptyEditor: document.getElementById("emptyEditor"),
		outputList: document.getElementById("outputList"),
		statusLeft: document.getElementById("statusLeft"),
		statusRight: document.getElementById("statusRight"),
		connectionDot: document.getElementById("connectionDot"),
		commandButton: document.getElementById("commandButton"),
		refreshButton: document.getElementById("refreshButton"),
		logoutButton: document.getElementById("logoutButton"),
		explorerViewButton: document.getElementById("explorerViewButton"),
		searchViewButton: document.getElementById("searchViewButton"),
		explorerView: document.getElementById("explorerView"),
		searchView: document.getElementById("searchView"),
		searchInput: document.getElementById("searchInput"),
		searchResults: document.getElementById("searchResults"),
		clearOutputButton: document.getElementById("clearOutputButton"),
		togglePanelButton: document.getElementById("togglePanelButton"),
		newScriptButton: document.getElementById("newScriptButton"),
		contextMenu: document.getElementById("contextMenu")
	};

	const state = {
		sessionId: "",
		secret: "",
		items: [],
		itemsById: new Map(),
		childrenByParent: new Map(),
		openTabs: [],
		activeFileId: "",
		models: new Map(),
		modelMeta: new Map(),
		editor: null,
		monaco: null,
		lastOutputId: 0,
		outputTimer: null,
		refreshTimer: null,
		saveTimer: null,
		searchTimer: null,
		loading: false
	};

	function text(value) {
		return String(value === null || value === undefined ? "" : value);
	}

	function setStatus(message) {
		refs.statusLeft.textContent = message || "Ready";
	}

	function setConnected(value) {
		refs.connectionDot.classList.toggle("connected", !!value);
		refs.commandButton.textContent = value ? "Connected to " + state.sessionId : "Disconnected";
	}

	function isScript(item) {
		return item && (item.className === "Script" || item.className === "LocalScript" || item.className === "ModuleScript");
	}

	function sortItems(items) {
		return items.slice().sort((a, b) => {
			const leftKind = a.kind === "folder" ? 0 : 1;
			const rightKind = b.kind === "folder" ? 0 : 1;
			if (leftKind !== rightKind) return leftKind - rightKind;
			return text(a.name).localeCompare(text(b.name));
		});
	}

	function rebuildIndexes() {
		state.itemsById = new Map();
		state.childrenByParent = new Map();
		for (const item of state.items) {
			state.itemsById.set(item.itemId || item.fileId, item);
			state.itemsById.set(item.fileId, item);
			const parentId = item.parentItemId || "";
			if (!state.childrenByParent.has(parentId)) state.childrenByParent.set(parentId, []);
			state.childrenByParent.get(parentId).push(item);
		}
		for (const [key, children] of state.childrenByParent) {
			state.childrenByParent.set(key, sortItems(children));
		}
	}

	function itemIcon(item) {
		if (!item) return "";
		if (item.kind === "folder") return "▸";
		if (item.className === "ModuleScript") return "M";
		if (item.className === "LocalScript") return "L";
		return "S";
	}

	function renderTree() {
		refs.treeRoot.innerHTML = "";
		const roots = new Map();
		for (const item of state.items) {
			if (!item.parentItemId) {
				const rootKey = "root:" + item.root;
				if (!roots.has(rootKey)) {
					roots.set(rootKey, { fileId: rootKey, itemId: rootKey, name: item.root, kind: "root", root: item.root });
				}
			}
		}
		const orderedRoots = Array.from(roots.values()).sort((a, b) => a.name.localeCompare(b.name));
		for (const root of orderedRoots) {
			const row = treeRow(root, 0, true);
			refs.treeRoot.appendChild(row);
			const children = state.items.filter(item => item.root === root.root && !item.parentItemId);
			for (const child of sortItems(children)) renderTreeItem(child, 1);
		}
	}

	function treeRow(item, depth, expanded) {
		const row = document.createElement("div");
		row.className = "tree-row";
		if (item.fileId === state.activeFileId || item.itemId === state.activeFileId) row.classList.add("active");
		row.style.setProperty("--depth", depth);
		row.dataset.fileId = item.fileId || item.itemId || "";
		row.innerHTML = `<span class="tree-indent"></span><span class="tree-arrow">${item.kind === "folder" || item.kind === "root" ? expanded ? "⌄" : "›" : ""}</span><span class="tree-icon">${item.kind === "root" ? "" : itemIcon(item)}</span><span class="tree-name"></span>`;
		row.querySelector(".tree-name").textContent = item.name;
		if (isScript(item)) {
			row.addEventListener("click", () => openFile(item.fileId));
		}
		row.addEventListener("contextmenu", event => {
			event.preventDefault();
			showContextMenu(event.clientX, event.clientY, item);
		});
		return row;
	}

	function renderTreeItem(item, depth) {
		refs.treeRoot.appendChild(treeRow(item, depth, true));
		const children = state.childrenByParent.get(item.itemId || item.fileId) || [];
		for (const child of children) renderTreeItem(child, depth + 1);
	}

	function renderTabs() {
		refs.tabs.innerHTML = "";
		for (const tab of state.openTabs) {
			const item = state.itemsById.get(tab.fileId);
			const node = document.createElement("div");
			node.className = "tab";
			if (tab.fileId === state.activeFileId) node.classList.add("active");
			node.innerHTML = "<span></span><button type=\"button\">×</button>";
			node.querySelector("span").textContent = item ? item.name : tab.name;
			node.addEventListener("click", () => openFile(tab.fileId));
			node.querySelector("button").addEventListener("click", event => {
				event.stopPropagation();
				closeTab(tab.fileId);
			});
			refs.tabs.appendChild(node);
		}
	}

	function currentMeta() {
		return state.modelMeta.get(state.activeFileId) || null;
	}

	function saveCurrentViewState() {
		if (state.activeFileId && state.editor) editorTools.saveViewState(state.activeFileId, state.editor);
	}

	async function ensureEditor() {
		if (state.editor) return;
		const created = await editorTools.createEditor(refs.editorHost);
		state.editor = created.editor;
		state.monaco = created.monaco;
		state.editor.onDidChangeModelContent(() => {
			const meta = currentMeta();
			if (!meta || meta.settingValue) return;
			meta.dirty = true;
			renderTabs();
			scheduleSave();
			scheduleViewStateSave();
		});
		state.editor.onDidScrollChange(scheduleViewStateSave);
		state.editor.onDidChangeCursorPosition(scheduleViewStateSave);
		state.editor.addCommand(state.monaco.KeyMod.CtrlCmd | state.monaco.KeyCode.KeyS, () => saveActiveFile(true));
		state.editor.addCommand(state.monaco.KeyMod.CtrlCmd | state.monaco.KeyMod.Shift | state.monaco.KeyCode.KeyE, async () => {
			await state.editor.getAction("editor.foldAll").run();
			saveCurrentViewState();
		});
		state.editor.addCommand(state.monaco.KeyMod.CtrlCmd | state.monaco.KeyCode.KeyE, async () => {
			await state.editor.getAction("editor.unfoldAll").run();
			saveCurrentViewState();
		});
	}

	function scheduleViewStateSave() {
		clearTimeout(state.viewTimer);
		state.viewTimer = setTimeout(saveCurrentViewState, 120);
	}

	function getModel(fileId, source) {
		if (state.models.has(fileId)) return state.models.get(fileId);
		const model = state.monaco.editor.createModel(source || "", "lua");
		state.models.set(fileId, model);
		state.modelMeta.set(fileId, { sourceHash: "", dirty: false, settingValue: false });
		return model;
	}

	async function openFile(fileId, line, column) {
		const item = state.itemsById.get(fileId);
		if (!item || !isScript(item)) return;
		await ensureEditor();
		saveCurrentViewState();
		let model = state.models.get(item.fileId);
		if (!model) {
			setStatus("Loading " + item.name);
			const data = await api.source(state.sessionId, item.fileId);
			model = getModel(item.fileId, data.source || "");
			state.modelMeta.set(item.fileId, { sourceHash: data.sourceHash || "", dirty: false, settingValue: false });
		}
		if (!state.openTabs.some(tab => tab.fileId === item.fileId)) state.openTabs.push({ fileId: item.fileId, name: item.name });
		state.activeFileId = item.fileId;
		state.editor.setModel(model);
		editorTools.restoreViewState(item.fileId, state.editor);
		if (line) {
			state.editor.revealLineInCenter(Number(line));
			state.editor.setPosition({ lineNumber: Number(line), column: Number(column || 1) });
			state.editor.focus();
		}
		refs.emptyEditor.classList.add("hidden");
		renderTree();
		renderTabs();
		setStatus(item.path || item.name);
		refs.statusRight.textContent = item.className + " | Line " + (line || state.editor.getPosition().lineNumber);
	}

	function closeTab(fileId) {
		saveCurrentViewState();
		const index = state.openTabs.findIndex(tab => tab.fileId === fileId);
		if (index < 0) return;
		state.openTabs.splice(index, 1);
		if (state.activeFileId === fileId) {
			const next = state.openTabs[Math.max(0, index - 1)] || state.openTabs[0];
			state.activeFileId = "";
			if (next) openFile(next.fileId);
			else {
				if (state.editor) state.editor.setModel(null);
				refs.emptyEditor.classList.remove("hidden");
				renderTabs();
				renderTree();
			}
		} else {
			renderTabs();
		}
	}

	function scheduleSave() {
		clearTimeout(state.saveTimer);
		state.saveTimer = setTimeout(() => saveActiveFile(false), 550);
	}

	async function saveActiveFile(force) {
		const fileId = state.activeFileId;
		const model = state.models.get(fileId);
		const meta = state.modelMeta.get(fileId);
		if (!fileId || !model || !meta) return;
		if (!force && !meta.dirty) return;
		const source = model.getValue();
		try {
			setStatus("Saving");
			const result = await api.save(state.sessionId, fileId, source);
			meta.dirty = false;
			meta.sourceHash = result.sourceHash || meta.sourceHash;
			setStatus("Saved revision " + result.revision);
			renderTabs();
		} catch (error) {
			setStatus("Save failed: " + error.message);
		}
	}

	async function refreshFiles(silent) {
		if (state.loading) return;
		state.loading = true;
		try {
			const data = await api.files(state.sessionId);
			state.items = data.items || data.files || [];
			rebuildIndexes();
			renderTree();
			setConnected(true);
			if (!silent) setStatus("Workspace refreshed");
		} catch (error) {
			setConnected(false);
			if (!silent) setStatus("Refresh failed: " + error.message);
		} finally {
			state.loading = false;
		}
	}

	async function login(sessionId, secret) {
		state.sessionId = sessionId.trim();
		state.secret = secret.trim();
		api.setStoredSession(state.sessionId, state.secret);
		await api.files(state.sessionId);
		refs.sessionGate.classList.add("hidden");
		refs.workbench.classList.remove("hidden");
		setConnected(true);
		await refreshFiles(true);
		startPolling();
	}

	function logout() {
		stopPolling();
		api.clearStoredSession();
		state.sessionId = "";
		state.secret = "";
		state.items = [];
		state.itemsById.clear();
		state.childrenByParent.clear();
		state.openTabs = [];
		state.activeFileId = "";
		for (const model of state.models.values()) model.dispose();
		state.models.clear();
		state.modelMeta.clear();
		state.lastOutputId = 0;
		refs.outputList.innerHTML = "";
		refs.workbench.classList.add("hidden");
		refs.sessionGate.classList.remove("hidden");
		setConnected(false);
	}

	function startPolling() {
		stopPolling();
		state.outputTimer = setInterval(fetchOutput, 1000);
		state.refreshTimer = setInterval(() => refreshFiles(true), 6000);
		fetchOutput();
	}

	function stopPolling() {
		clearInterval(state.outputTimer);
		clearInterval(state.refreshTimer);
	}

	function outputClass(level) {
		if (level === "error") return "error";
		if (level === "warn" || level === "warning") return "warn";
		if (level === "print" || level === "output") return "print";
		return "info";
	}

	async function fetchOutput() {
		if (!state.sessionId) return;
		try {
			const data = await api.output(state.sessionId, state.lastOutputId);
			state.lastOutputId = data.lastOutputId || state.lastOutputId;
			for (const entry of data.entries || []) appendOutput(entry);
		} catch (error) {
		}
	}

	function appendOutput(entry) {
		const node = document.createElement("div");
		const level = outputClass(entry.level);
		node.className = "output-entry " + level;
		const location = formatLocation(entry);
		node.innerHTML = "<span class=\"output-time\"></span><span class=\"output-source\"></span><span class=\"output-message\"></span><span class=\"output-location\"></span>";
		node.querySelector(".output-time").textContent = entry.clock || new Date(entry.createdAt || Date.now()).toLocaleTimeString();
		node.querySelector(".output-source").textContent = level;
		node.querySelector(".output-message").textContent = [entry.message, entry.stackTrace].filter(Boolean).join("\n");
		node.querySelector(".output-location").textContent = location;
		node.addEventListener("click", () => openOutputEntry(entry));
		refs.outputList.appendChild(node);
		refs.outputList.scrollTop = refs.outputList.scrollHeight;
	}

	function formatLocation(entry) {
		if (entry.line) return "Line " + entry.line;
		return "";
	}

	function normalizeComparablePath(value) {
		return text(value).replace(/\\/g, "/").replace(/\./g, "/").replace(/^game\//i, "").toLowerCase();
	}

	function findItemForOutput(entry) {
		if (entry.itemId && state.itemsById.has(entry.itemId)) return state.itemsById.get(entry.itemId);
		const root = text(entry.root).toLowerCase();
		const relative = normalizeComparablePath(entry.relativePath || entry.scriptPath || "");
		for (const item of state.items) {
			if (!isScript(item)) continue;
			const itemRoot = text(item.root).toLowerCase();
			const values = [item.relativePath, item.instancePath, item.path, item.root + "/" + item.relativePath, item.root + "/" + item.instancePath].map(normalizeComparablePath);
			if (root && itemRoot !== root) continue;
			if (values.some(value => value === relative || relative.endsWith(value) || value.endsWith(relative))) return item;
		}
		return null;
	}

	async function openOutputEntry(entry) {
		const item = findItemForOutput(entry);
		if (!item) {
			setStatus("Script not found for output entry");
			return;
		}
		await openFile(item.fileId, entry.line || 1, entry.column || 1);
	}

	async function runSearch(query) {
		query = query.trim();
		refs.searchResults.innerHTML = "";
		if (!query) return;
		try {
			const data = await api.search(state.sessionId, query);
			for (const result of data.results || []) {
				const row = document.createElement("div");
				row.className = "search-result";
				row.innerHTML = "<strong></strong><span></span>";
				row.querySelector("strong").textContent = (result.path || result.name) + ":" + result.line;
				row.querySelector("span").textContent = result.preview || "";
				row.addEventListener("click", () => openFile(result.fileId, result.line, result.column));
				refs.searchResults.appendChild(row);
			}
		} catch (error) {
			refs.searchResults.textContent = error.message;
		}
	}

	function switchView(name) {
		const search = name === "search";
		refs.searchView.classList.toggle("active", search);
		refs.explorerView.classList.toggle("active", !search);
		refs.searchViewButton.classList.toggle("active", search);
		refs.explorerViewButton.classList.toggle("active", !search);
		if (search) refs.searchInput.focus();
	}

	function showContextMenu(x, y, item) {
		refs.contextMenu.innerHTML = "";
		const actions = [];
		if (item.kind === "root" || item.kind === "folder") actions.push(["New Script", () => openCreateDialog(item)]);
		if (isScript(item)) actions.push(["Open", () => openFile(item.fileId)]);
		if (item.kind !== "root") actions.push(["Delete", () => deleteItem(item)]);
		for (const action of actions) {
			const button = document.createElement("button");
			button.textContent = action[0];
			button.addEventListener("click", () => {
				hideContextMenu();
				action[1]();
			});
			refs.contextMenu.appendChild(button);
		}
		refs.contextMenu.style.left = x + "px";
		refs.contextMenu.style.top = y + "px";
		refs.contextMenu.classList.remove("hidden");
	}

	function hideContextMenu() {
		refs.contextMenu.classList.add("hidden");
	}

	function dialog(title, fields, onSubmit) {
		const backdrop = document.createElement("div");
		backdrop.className = "dialog-backdrop";
		const card = document.createElement("form");
		card.className = "dialog-card";
		const titleNode = document.createElement("h3");
		titleNode.textContent = title;
		card.appendChild(titleNode);
		const inputs = {};
		for (const field of fields) {
			const input = document.createElement("input");
			input.className = "dialog-input";
			input.placeholder = field.placeholder || field.name;
			input.value = field.value || "";
			input.spellcheck = false;
			inputs[field.name] = input;
			card.appendChild(input);
		}
		const actions = document.createElement("div");
		actions.className = "dialog-actions";
		const cancel = document.createElement("button");
		cancel.type = "button";
		cancel.textContent = "Cancel";
		const submit = document.createElement("button");
		submit.className = "primary";
		submit.type = "submit";
		submit.textContent = "Create";
		actions.appendChild(cancel);
		actions.appendChild(submit);
		card.appendChild(actions);
		backdrop.appendChild(card);
		document.body.appendChild(backdrop);
		cancel.addEventListener("click", () => backdrop.remove());
		card.addEventListener("submit", event => {
			event.preventDefault();
			const value = {};
			for (const key of Object.keys(inputs)) value[key] = inputs[key].value;
			backdrop.remove();
			onSubmit(value);
		});
		fields[0] && inputs[fields[0].name].focus();
	}

	function openCreateDialog(parent) {
		dialog("New Script", [{ name: "name", placeholder: "Script name", value: "NewScript" }], async value => {
			const parentIsRoot = parent.kind === "root";
			const body = {
				className: "Script",
				name: value.name || "NewScript",
				root: parentIsRoot ? parent.root : parent.root,
				parentItemId: parentIsRoot ? "" : parent.itemId || parent.fileId,
				parentRelativePath: parentIsRoot ? "" : parent.relativePath,
				source: "print(\"Hello from Cloud\")"
			};
			try {
				const result = await api.create(state.sessionId, body);
				await refreshFiles(true);
				await openFile(result.item.fileId);
			} catch (error) {
				setStatus(error.message);
			}
		});
	}

	async function deleteItem(item) {
		if (!confirm("Delete " + item.name + "?")) return;
		try {
			await api.delete(state.sessionId, item.fileId);
			closeTab(item.fileId);
			await refreshFiles(true);
		} catch (error) {
			setStatus(error.message);
		}
	}

	refs.loginForm.addEventListener("submit", async event => {
		event.preventDefault();
		refs.loginMessage.textContent = "";
		try {
			await login(refs.sessionInput.value, refs.secretInput.value);
		} catch (error) {
			refs.loginMessage.textContent = error.message;
		}
	});

	refs.refreshButton.addEventListener("click", () => refreshFiles(false));
	refs.logoutButton.addEventListener("click", logout);
	refs.explorerViewButton.addEventListener("click", () => switchView("explorer"));
	refs.searchViewButton.addEventListener("click", () => switchView("search"));
	refs.searchInput.addEventListener("input", () => {
		clearTimeout(state.searchTimer);
		state.searchTimer = setTimeout(() => runSearch(refs.searchInput.value), 220);
	});
	refs.clearOutputButton.addEventListener("click", async () => {
		try {
			await api.clearOutput(state.sessionId);
			refs.outputList.innerHTML = "";
			state.lastOutputId = 0;
		} catch (error) {
			setStatus(error.message);
		}
	});
	refs.togglePanelButton.addEventListener("click", () => document.querySelector(".panel").classList.toggle("collapsed"));
	refs.newScriptButton.addEventListener("click", () => openCreateDialog({ kind: "root", root: "ServerScriptService" }));
	document.addEventListener("click", hideContextMenu);
	document.addEventListener("keydown", event => {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
			event.preventDefault();
			switchView("search");
		}
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
			event.preventDefault();
			saveActiveFile(true);
		}
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "w") {
			event.preventDefault();
			if (state.activeFileId) closeTab(state.activeFileId);
		}
	});

	async function boot() {
		const stored = api.getStoredSession();
		refs.sessionInput.value = stored.sessionId;
		refs.secretInput.value = stored.secret;
		if (stored.sessionId && stored.secret) {
			try {
				await login(stored.sessionId, stored.secret);
			} catch (error) {
				refs.loginMessage.textContent = "Stored session is not active.";
			}
		}
	}

	boot();
}());
