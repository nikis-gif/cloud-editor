import {
	LUA_KEYWORDS,
	SERVICE_NAMES,
	GLOBALS,
	INSTANCE_METHODS,
	SIGNAL_METHODS,
	COMMON_EVENTS,
	COMMON_PROPERTIES,
	CONTEXT_COMPLETIONS,
	CLASS_HINTS,
	EXTRA_CLASS_COMPLETIONS,
	SNIPPETS,
	ROBLOX_CLASSES,
} from "./robloxApi.js";

function defineLuaSupport(monaco) {
	monaco.languages.setLanguageConfiguration("lua", {
		comments: { lineComment: "--", blockComment: ["--[[", "]]" ] },
		brackets: [["(", ")"], ["{", "}"], ["[", "]"]],
		autoClosingPairs: [
			{ open: "(", close: ")" },
			{ open: "{", close: "}" },
			{ open: "[", close: "]" },
			{ open: "\"", close: "\"" },
			{ open: "'", close: "'" },
		],
		surroundingPairs: [
			{ open: "(", close: ")" },
			{ open: "{", close: "}" },
			{ open: "[", close: "]" },
			{ open: "\"", close: "\"" },
			{ open: "'", close: "'" },
		],
	});
}

function theme(base, rules, colors) {
	return { base, inherit: true, rules, colors };
}

function defineThemes(monaco) {
	const baseRules = [
		{ token: "keyword", foreground: "569CD6", fontStyle: "bold" },
		{ token: "string", foreground: "CE9178" },
		{ token: "number", foreground: "B5CEA8" },
		{ token: "comment", foreground: "6A9955", fontStyle: "italic" },
		{ token: "function", foreground: "DCDCAA" },
	];

	monaco.editor.defineTheme("cloud-codex", theme("vs-dark", baseRules, {
		"editor.background": "#171819", "editor.foreground": "#d8d8d8", "editorLineNumber.foreground": "#6f737a", "editorLineNumber.activeForeground": "#d0d3d8", "editorCursor.foreground": "#ffffff", "editor.selectionBackground": "#2d333b", "editor.inactiveSelectionBackground": "#25282c", "editorSuggestWidget.background": "#1f2023", "editorSuggestWidget.border": "#34363b", "editorSuggestWidget.selectedBackground": "#30343b", "editorSuggestWidget.foreground": "#e5e5e5", "editorSuggestWidget.highlightForeground": "#8ab4f8", "editorWidget.background": "#1f2023", "editorWidget.border": "#34363b",
	}));
	monaco.editor.defineTheme("cloud-dark", theme("vs-dark", baseRules, {
		"editor.background": "#1e1e1e", "editor.foreground": "#d4d4d4", "editorLineNumber.foreground": "#858585", "editorLineNumber.activeForeground": "#c6c6c6", "editorCursor.foreground": "#aeafad", "editor.selectionBackground": "#264f78", "editor.inactiveSelectionBackground": "#3a3d41", "editorSuggestWidget.background": "#252526", "editorSuggestWidget.border": "#454545", "editorSuggestWidget.selectedBackground": "#04395e", "editorSuggestWidget.foreground": "#d4d4d4", "editorSuggestWidget.highlightForeground": "#4fc1ff",
	}));
	monaco.editor.defineTheme("cloud-graphite", theme("vs-dark", [
		{ token: "keyword", foreground: "c9d1d9", fontStyle: "bold" }, { token: "string", foreground: "a5d6ff" }, { token: "number", foreground: "79c0ff" }, { token: "comment", foreground: "8b949e", fontStyle: "italic" }, { token: "function", foreground: "d2a8ff" },
	], { "editor.background": "#111315", "editor.foreground": "#c9d1d9", "editorLineNumber.foreground": "#555c66", "editorCursor.foreground": "#c9d1d9", "editor.selectionBackground": "#30363d", "editorSuggestWidget.background": "#161b22", "editorSuggestWidget.border": "#30363d", "editorSuggestWidget.selectedBackground": "#262b33", "editorSuggestWidget.highlightForeground": "#79c0ff" }));
	monaco.editor.defineTheme("cloud-void", theme("vs-dark", [
		{ token: "keyword", foreground: "e5e7eb", fontStyle: "bold" }, { token: "string", foreground: "d1d5db" }, { token: "number", foreground: "f3f4f6" }, { token: "comment", foreground: "6b7280", fontStyle: "italic" }, { token: "function", foreground: "ffffff" },
	], { "editor.background": "#050505", "editor.foreground": "#e5e7eb", "editorLineNumber.foreground": "#4b5563", "editorCursor.foreground": "#ffffff", "editor.selectionBackground": "#303030", "editorSuggestWidget.background": "#111111", "editorSuggestWidget.border": "#2a2a2a", "editorSuggestWidget.selectedBackground": "#272727", "editorSuggestWidget.highlightForeground": "#ffffff" }));
	monaco.editor.defineTheme("cloud-midnight", theme("vs-dark", [
		{ token: "keyword", foreground: "93c5fd", fontStyle: "bold" }, { token: "string", foreground: "fca5a5" }, { token: "number", foreground: "86efac" }, { token: "comment", foreground: "64748b", fontStyle: "italic" }, { token: "function", foreground: "fde68a" },
	], { "editor.background": "#0b1220", "editor.foreground": "#dbeafe", "editorLineNumber.foreground": "#51607a", "editorCursor.foreground": "#93c5fd", "editor.selectionBackground": "#1d4ed888", "editorSuggestWidget.background": "#111827", "editorSuggestWidget.border": "#243044", "editorSuggestWidget.selectedBackground": "#1e3a8a", "editorSuggestWidget.foreground": "#dbeafe", "editorSuggestWidget.highlightForeground": "#93c5fd" }));
	monaco.editor.defineTheme("cloud-warm", theme("vs-dark", [
		{ token: "keyword", foreground: "d9a657", fontStyle: "bold" }, { token: "string", foreground: "c9a66b" }, { token: "number", foreground: "f0c674" }, { token: "comment", foreground: "7f735f", fontStyle: "italic" }, { token: "function", foreground: "f4d28c" },
	], { "editor.background": "#17120d", "editor.foreground": "#eadfc9", "editorLineNumber.foreground": "#6f6048", "editorCursor.foreground": "#f2c56b", "editor.selectionBackground": "#5f431f88", "editorSuggestWidget.background": "#211910", "editorSuggestWidget.border": "#5a4224", "editorSuggestWidget.selectedBackground": "#4c3517", "editorSuggestWidget.foreground": "#eadfc9", "editorSuggestWidget.highlightForeground": "#ffd37a" }));
	monaco.editor.defineTheme("cloud-forest", theme("vs-dark", [
		{ token: "keyword", foreground: "9ece6a", fontStyle: "bold" }, { token: "string", foreground: "e0af68" }, { token: "number", foreground: "7aa2f7" }, { token: "comment", foreground: "565f70", fontStyle: "italic" }, { token: "function", foreground: "bb9af7" },
	], { "editor.background": "#11160f", "editor.foreground": "#d7dfcf", "editorLineNumber.foreground": "#53624f", "editorCursor.foreground": "#9ece6a", "editor.selectionBackground": "#2f3b2f", "editorSuggestWidget.background": "#172015", "editorSuggestWidget.border": "#2b3a27", "editorSuggestWidget.selectedBackground": "#25351f", "editorSuggestWidget.highlightForeground": "#9ece6a" }));
	monaco.editor.defineTheme("cloud-rose-pine", theme("vs-dark", [
		{ token: "keyword", foreground: "c4a7e7", fontStyle: "bold" }, { token: "string", foreground: "ebbcba" }, { token: "number", foreground: "f6c177" }, { token: "comment", foreground: "6e6a86", fontStyle: "italic" }, { token: "function", foreground: "9ccfd8" },
	], { "editor.background": "#191724", "editor.foreground": "#e0def4", "editorLineNumber.foreground": "#6e6a86", "editorCursor.foreground": "#e0def4", "editor.selectionBackground": "#403d52", "editorSuggestWidget.background": "#1f1d2e", "editorSuggestWidget.border": "#31748f", "editorSuggestWidget.selectedBackground": "#26233a", "editorSuggestWidget.highlightForeground": "#9ccfd8" }));
	monaco.editor.defineTheme("cloud-nord", theme("vs-dark", [
		{ token: "keyword", foreground: "81a1c1", fontStyle: "bold" }, { token: "string", foreground: "a3be8c" }, { token: "number", foreground: "b48ead" }, { token: "comment", foreground: "616e88", fontStyle: "italic" }, { token: "function", foreground: "88c0d0" },
	], { "editor.background": "#2e3440", "editor.foreground": "#d8dee9", "editorLineNumber.foreground": "#667085", "editorCursor.foreground": "#88c0d0", "editor.selectionBackground": "#434c5e", "editorSuggestWidget.background": "#3b4252", "editorSuggestWidget.border": "#4c566a", "editorSuggestWidget.selectedBackground": "#434c5e", "editorSuggestWidget.highlightForeground": "#88c0d0" }));
	monaco.editor.defineTheme("cloud-dracula", theme("vs-dark", [
		{ token: "keyword", foreground: "ff79c6", fontStyle: "bold" }, { token: "string", foreground: "f1fa8c" }, { token: "number", foreground: "bd93f9" }, { token: "comment", foreground: "6272a4", fontStyle: "italic" }, { token: "function", foreground: "50fa7b" },
	], { "editor.background": "#282a36", "editor.foreground": "#f8f8f2", "editorLineNumber.foreground": "#6272a4", "editorCursor.foreground": "#f8f8f0", "editor.selectionBackground": "#44475a", "editorSuggestWidget.background": "#21222c", "editorSuggestWidget.border": "#44475a", "editorSuggestWidget.selectedBackground": "#44475a", "editorSuggestWidget.highlightForeground": "#8be9fd" }));
	monaco.editor.defineTheme("cloud-ocean", theme("vs-dark", [
		{ token: "keyword", foreground: "7dd3fc", fontStyle: "bold" }, { token: "string", foreground: "67e8f9" }, { token: "number", foreground: "a7f3d0" }, { token: "comment", foreground: "64748b", fontStyle: "italic" }, { token: "function", foreground: "f0abfc" },
	], { "editor.background": "#08111f", "editor.foreground": "#dbeafe", "editorLineNumber.foreground": "#475569", "editorCursor.foreground": "#38bdf8", "editor.selectionBackground": "#0e749044", "editorSuggestWidget.background": "#0f172a", "editorSuggestWidget.border": "#164e63", "editorSuggestWidget.selectedBackground": "#12324a", "editorSuggestWidget.highlightForeground": "#67e8f9" }));
	monaco.editor.defineTheme("cloud-mono", theme("vs-dark", [
		{ token: "keyword", foreground: "ffffff", fontStyle: "bold" }, { token: "string", foreground: "d4d4d4" }, { token: "number", foreground: "cfcfcf" }, { token: "comment", foreground: "777777", fontStyle: "italic" }, { token: "function", foreground: "eeeeee" },
	], { "editor.background": "#101010", "editor.foreground": "#e7e7e7", "editorLineNumber.foreground": "#585858", "editorCursor.foreground": "#ffffff", "editor.selectionBackground": "#3a3a3a", "editorSuggestWidget.background": "#171717", "editorSuggestWidget.border": "#333333", "editorSuggestWidget.selectedBackground": "#2f2f2f", "editorSuggestWidget.highlightForeground": "#ffffff" }));
	monaco.editor.defineTheme("cloud-black-gray", theme("vs-dark", [
		{ token: "keyword", foreground: "a5b4fc", fontStyle: "bold" }, { token: "string", foreground: "d1d5db" }, { token: "number", foreground: "93c5fd" }, { token: "comment", foreground: "6b7280", fontStyle: "italic" }, { token: "function", foreground: "f3f4f6" },
	], { "editor.background": "#090a0e", "editor.foreground": "#e5e7eb", "editorLineNumber.foreground": "#4b5563", "editorCursor.foreground": "#ffffff", "editor.selectionBackground": "#374151", "editorSuggestWidget.background": "#111827", "editorSuggestWidget.border": "#30363d", "editorSuggestWidget.selectedBackground": "#1f2937", "editorSuggestWidget.highlightForeground": "#93c5fd" }));
	monaco.editor.defineTheme("cloud-white", theme("vs", [
		{ token: "keyword", foreground: "2563eb", fontStyle: "bold" }, { token: "string", foreground: "b45309" }, { token: "number", foreground: "047857" }, { token: "comment", foreground: "6b7280", fontStyle: "italic" }, { token: "function", foreground: "7c3aed" },
	], { "editor.background": "#ffffff", "editor.foreground": "#1f2937", "editorLineNumber.foreground": "#9ca3af", "editorCursor.foreground": "#111827", "editor.selectionBackground": "#bfdbfe", "editorSuggestWidget.background": "#ffffff", "editorSuggestWidget.border": "#d1d5db", "editorSuggestWidget.selectedBackground": "#e5efff", "editorSuggestWidget.highlightForeground": "#2563eb" }));
	monaco.editor.defineTheme("cloud-pink", theme("vs-dark", [
		{ token: "keyword", foreground: "f472b6", fontStyle: "bold" }, { token: "string", foreground: "f9a8d4" }, { token: "number", foreground: "fda4af" }, { token: "comment", foreground: "9d7189", fontStyle: "italic" }, { token: "function", foreground: "f0abfc" },
	], { "editor.background": "#1b0f18", "editor.foreground": "#ffe4f1", "editorLineNumber.foreground": "#8b5a72", "editorCursor.foreground": "#f9a8d4", "editor.selectionBackground": "#83184388", "editorSuggestWidget.background": "#21101d", "editorSuggestWidget.border": "#831843", "editorSuggestWidget.selectedBackground": "#3b112d", "editorSuggestWidget.highlightForeground": "#f9a8d4" }));
	monaco.editor.defineTheme("cloud-purple", theme("vs-dark", [
		{ token: "keyword", foreground: "c4b5fd", fontStyle: "bold" }, { token: "string", foreground: "ddd6fe" }, { token: "number", foreground: "a78bfa" }, { token: "comment", foreground: "7c719e", fontStyle: "italic" }, { token: "function", foreground: "93c5fd" },
	], { "editor.background": "#130f24", "editor.foreground": "#ede9fe", "editorLineNumber.foreground": "#6d5c91", "editorCursor.foreground": "#c4b5fd", "editor.selectionBackground": "#5b21b688", "editorSuggestWidget.background": "#1a1332", "editorSuggestWidget.border": "#4c1d95", "editorSuggestWidget.selectedBackground": "#2e1a55", "editorSuggestWidget.highlightForeground": "#c4b5fd" }));
	monaco.editor.defineTheme("cloud-matrix", theme("vs-dark", [
		{ token: "keyword", foreground: "00ff84", fontStyle: "bold" }, { token: "string", foreground: "6ee7b7" }, { token: "number", foreground: "bbf7d0" }, { token: "comment", foreground: "166534", fontStyle: "italic" }, { token: "function", foreground: "22c55e" },
	], { "editor.background": "#020403", "editor.foreground": "#b7ffd8", "editorLineNumber.foreground": "#14532d", "editorCursor.foreground": "#00ff84", "editor.selectionBackground": "#064e3b88", "editorSuggestWidget.background": "#04120a", "editorSuggestWidget.border": "#064e3b", "editorSuggestWidget.selectedBackground": "#06351f", "editorSuggestWidget.highlightForeground": "#00ff84" }));
	monaco.editor.defineTheme("cloud-bubble", theme("vs-dark", [
		{ token: "keyword", foreground: "67e8f9", fontStyle: "bold" }, { token: "string", foreground: "f0abfc" }, { token: "number", foreground: "a7f3d0" }, { token: "comment", foreground: "64748b", fontStyle: "italic" }, { token: "function", foreground: "bfdbfe" },
	], { "editor.background": "#10172a", "editor.foreground": "#e0f2fe", "editorLineNumber.foreground": "#64748b", "editorCursor.foreground": "#67e8f9", "editor.selectionBackground": "#155e7588", "editorSuggestWidget.background": "#0f172a", "editorSuggestWidget.border": "#334155", "editorSuggestWidget.selectedBackground": "#1e293b", "editorSuggestWidget.highlightForeground": "#67e8f9" }));
	monaco.editor.defineTheme("cloud-sky", theme("vs-dark", [
		{ token: "keyword", foreground: "38bdf8", fontStyle: "bold" }, { token: "string", foreground: "bae6fd" }, { token: "number", foreground: "7dd3fc" }, { token: "comment", foreground: "64748b", fontStyle: "italic" }, { token: "function", foreground: "fef3c7" },
	], { "editor.background": "#06162e", "editor.foreground": "#eaf6ff", "editorLineNumber.foreground": "#55708f", "editorCursor.foreground": "#38bdf8", "editor.selectionBackground": "#0369a188", "editorSuggestWidget.background": "#0b1f3a", "editorSuggestWidget.border": "#0c4a6e", "editorSuggestWidget.selectedBackground": "#123861", "editorSuggestWidget.highlightForeground": "#38bdf8" }));

	monaco.editor.defineTheme("cloud-contrast", theme("hc-black", baseRules, { "editor.background": "#000000", "editor.foreground": "#ffffff", "editor.selectionBackground": "#004b76" }));
}

function registerCompletions(monaco) {
	const snippetRule = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
	const methodKind = monaco.languages.CompletionItemKind.Method;
	const eventKind = monaco.languages.CompletionItemKind.Event;
	const propertyKind = monaco.languages.CompletionItemKind.Property;
	const functionKind = monaco.languages.CompletionItemKind.Function;
	const classKind = monaco.languages.CompletionItemKind.Class;
	const variableKind = monaco.languages.CompletionItemKind.Variable;
	const keywordKind = monaco.languages.CompletionItemKind.Keyword;
	const snippetKind = monaco.languages.CompletionItemKind.Snippet;

	function range(model, position) {
		const word = model.getWordUntilPosition(position);
		return { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
	}

	function cleanSnippetPlace(linePrefix) {
		const text = String(linePrefix || "");
		if (/game[:.]\w*$/.test(text)) return false;
		if (/[\w\]\)\"'][:.]\w*$/.test(text)) return false;
		if (/=\s*[^\s]*$/.test(text)) return false;
		return /^\s*$/.test(text) || /^\s*(local|function|task|pcall|Instance|for|if|while|repeat)?\w*$/i.test(text);
	}

	function cleanSnippetForPreview(value) {
		return String(value || "")
			.replace(/\$\{\d+:([^}]+)\}/g, "$1")
			.replace(/\$\d+/g, "")
			.replace(/\n{3,}/g, "\n\n");
	}

	function codePreview(value) {
		const preview = cleanSnippetForPreview(value);
		return preview ? "```lua\n" + preview + "\n```" : "";
	}

	function completionDocumentation(label, insertText, detail, description) {
		const parts = ["**" + String(label || "Completion") + "**"];
		if (detail) parts.push("`" + String(detail) + "`");
		if (description) parts.push(String(description));
		const preview = codePreview(insertText);
		if (preview) {
			parts.push("Preview:");
			parts.push(preview);
		}
		return { value: parts.join("\n\n") };
	}

	function completion(item, kind, sortPrefix, itemRange) {
		const label = item[0];
		const insertText = item[1];
		const detail = item[2] || "Game API";
		const description = item[3] || detail || "Game API completion.";
		return {
			label,
			kind,
			detail,
			documentation: completionDocumentation(label, insertText, detail, description),
			insertText,
			insertTextRules: snippetRule,
			sortText: sortPrefix + label,
			filterText: label,
			range: itemRange,
		};
	}

	function serviceDocumentation(serviceName) {
		return {
			value: "**" + serviceName + "** service\n\nUse this when you need direct access to the `" + serviceName + "` service.\n\nPreview:\n\n```lua\nlocal " + serviceName.replace(/[^A-Za-z0-9_]/g, "") + " = game:GetService(\"" + serviceName + "\")\n```",
		};
	}

	function shouldSuggestGetServiceSnippet(linePrefix) {
		const text = String(linePrefix || "");
		return /=\s*[A-Za-z_]*$/.test(text) || /game\s*[:.]\s*GetService\s*\(\s*["']?[^"']*$/.test(text) || /game\s*[:.]?\s*\w*$/.test(text);
	}

	function pushUnique(target, seen, item, kind, sortPrefix, itemRange) {
		const key = item[0] + "|" + item[1];
		if (seen.has(key)) return;
		seen.add(key);
		target.push(completion(item, kind, sortPrefix, itemRange));
	}

	function buildAliasMap(model, position) {
		const map = new Map();
		const text = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column });
		const servicePattern = /(?:local\s+)?([A-Za-z_][\w]*)\s*=\s*game\s*:\s*GetService\s*\(\s*["']([^"']+)["']\s*\)/g;
		let match;
		while ((match = servicePattern.exec(text))) {
			map.set(match[1], match[2]);
		}
		return map;
	}

	function getMemberContext(linePrefix) {
		const match = String(linePrefix || "").match(/([A-Za-z_][\w]*)\s*([:.])\s*\w*$/);
		if (!match) return null;
		return { base: match[1], operator: match[2] };
	}

	function inferClass(base, aliasMap) {
		if (!base) return "";
		if (base === "game") return "DataModel";
		if (base === "workspace") return "Workspace";
		if (aliasMap.has(base)) return aliasMap.get(base);
		if (SERVICE_NAMES.includes(base)) return base;

		const lower = base.toLowerCase();
		if (CLASS_HINTS[lower]) return CLASS_HINTS[lower];
		for (const key of Object.keys(CLASS_HINTS)) {
			if (lower.includes(key)) return CLASS_HINTS[key];
		}
		return "";
	}

	function addProperty(suggestions, seen, prop, detail, itemRange, sortPrefix = "020") {
		const key = "prop|" + detail + "|" + prop;
		if (seen.has(key)) return;
		seen.add(key);
		suggestions.push({
			label: prop,
			kind: propertyKind,
			detail,
			documentation: completionDocumentation(prop, prop, detail, "Property available on this context."),
			insertText: prop,
			sortText: sortPrefix + prop,
			filterText: prop,
			range: itemRange,
		});
	}

	function looksLikeSignalName(name) {
		return /(?:Added|Removing|Changed|Touched|Ended|Started|Finished|Completed|Stepped|Heartbeat|Died|Activated|Equipped|Unequipped|Event|Invoke|Click|Down|Up|Enter|Leave|Lost|Focused)$/i.test(String(name || ""));
	}

	function addContextualCompletions(suggestions, seen, contextName, operator, itemRange) {
		const context = CONTEXT_COMPLETIONS[contextName] || EXTRA_CLASS_COMPLETIONS[contextName];
		if (!context) return false;

		if (operator === ":") {
			for (const item of context.methods || []) pushUnique(suggestions, seen, item, methodKind, "001", itemRange);
			for (const item of INSTANCE_METHODS) pushUnique(suggestions, seen, item, methodKind, "030", itemRange);
			return true;
		}

		for (const item of context.events || []) pushUnique(suggestions, seen, item, eventKind, "000", itemRange);
		for (const item of context.callbacks || []) pushUnique(suggestions, seen, item, functionKind, "005", itemRange);
		for (const item of context.methods || []) pushUnique(suggestions, seen, item, methodKind, "010", itemRange);
		for (const prop of context.properties || []) addProperty(suggestions, seen, prop, contextName + " property", itemRange);
		return true;
	}

	monaco.languages.registerCompletionItemProvider("lua", {
		triggerCharacters: [".", ":", "\"", "'"],
		provideCompletionItems(model, position) {
			const itemRange = range(model, position);
			const linePrefix = model.getLineContent(position.lineNumber).slice(0, position.column - 1);
			const suggestions = [];
			const seen = new Set();
			const memberContext = getMemberContext(linePrefix);
			const aliasMap = buildAliasMap(model, position);

			if (memberContext) {
				const contextName = inferClass(memberContext.base, aliasMap);
				addContextualCompletions(suggestions, seen, contextName, memberContext.operator, itemRange);

				if (memberContext.operator === ":") {
					for (const item of SIGNAL_METHODS) pushUnique(suggestions, seen, item, eventKind, "002", itemRange);
					for (const item of INSTANCE_METHODS) pushUnique(suggestions, seen, item, methodKind, "040", itemRange);
				} else {
					for (const item of COMMON_EVENTS) pushUnique(suggestions, seen, item, eventKind, "050", itemRange);
					for (const item of INSTANCE_METHODS) pushUnique(suggestions, seen, item, methodKind, "070", itemRange);
					for (const prop of COMMON_PROPERTIES) {
						const key = "prop|" + prop;
						if (!seen.has(key)) {
							seen.add(key);
							suggestions.push({ label: prop, kind: propertyKind, detail: "Property", documentation: completionDocumentation(prop, prop, "Property", "Common Instance property."), insertText: prop, sortText: "090" + prop, filterText: prop, range: itemRange });
						}
					}
				}
			}

			if (/game[:.]\w*$/.test(linePrefix)) {
				pushUnique(suggestions, seen, ["GetService", "GetService(\"${1:Players}\")", "DataModel method", "Returns a game service by name."], methodKind, "000", itemRange);
			}

			const getServiceSnippetMode = shouldSuggestGetServiceSnippet(linePrefix);
			for (const serviceName of SERVICE_NAMES) {
				const key = "service|" + serviceName;
				if (!seen.has(key)) {
					seen.add(key);
					suggestions.push({
						label: serviceName,
						kind: classKind,
						detail: "Roblox service",
						documentation: serviceDocumentation(serviceName),
						insertText: serviceName,
						sortText: "210" + serviceName,
						range: itemRange,
					});
				}
				if (getServiceSnippetMode) {
					const snippetKey = "serviceSnippet|" + serviceName;
					if (!seen.has(snippetKey)) {
						seen.add(snippetKey);
						suggestions.push({
							label: "game:GetService(\"" + serviceName + "\")",
							kind: functionKind,
							detail: "Insert GetService for " + serviceName,
							documentation: serviceDocumentation(serviceName),
							insertText: "game:GetService(\"" + serviceName + "\")",
							insertTextRules: snippetRule,
							sortText: "000" + serviceName,
							range: itemRange,
						});
					}
				}
			}

			for (const globalName of GLOBALS) {
				const key = "global|" + globalName;
				if (seen.has(key)) continue;
				seen.add(key);
				suggestions.push({ label: globalName, kind: variableKind, detail: "Luau global", documentation: completionDocumentation(globalName, globalName, "Luau global", "Built-in Luau or Roblox global."), insertText: globalName, sortText: "220" + globalName, filterText: globalName, range: itemRange });
			}

			for (const keyword of LUA_KEYWORDS) {
				suggestions.push({ label: keyword, kind: keywordKind, detail: "Luau keyword", documentation: completionDocumentation(keyword, keyword, "Luau keyword", "Language keyword."), insertText: keyword, sortText: "230" + keyword, filterText: keyword, range: itemRange });
			}

			if (cleanSnippetPlace(linePrefix)) {
				SNIPPETS.forEach((item, index) => pushUnique(suggestions, seen, item, snippetKind, "000" + String(index).padStart(3, "0"), itemRange));
			}

			return { incomplete: false, suggestions };
		},
	});
}

function getFallbackTheme(themeName) {
	const themes = {
		"cloud-black-gray": ["#090a0e", "#e5e7eb"],
		"cloud-white": ["#ffffff", "#1f2937"],
		"cloud-pink": ["#1b0f18", "#ffe4f1"],
		"cloud-purple": ["#130f24", "#ede9fe"],
		"cloud-matrix": ["#020403", "#b7ffd8"],
		"cloud-bubble": ["#10172a", "#e0f2fe"],
		"cloud-sky": ["#06162e", "#eaf6ff"],
		"cloud-codex": ["#171819", "#d8d8d8"],
		"cloud-dark": ["#1e1e1e", "#d4d4d4"],
		"cloud-graphite": ["#111315", "#c9d1d9"],
		"cloud-void": ["#050505", "#e5e7eb"],
		"cloud-midnight": ["#0b1220", "#dbeafe"],
		"cloud-warm": ["#17120d", "#eadfc9"],
		"cloud-forest": ["#11160f", "#d7dfcf"],
		"cloud-rose-pine": ["#191724", "#e0def4"],
		"cloud-nord": ["#2e3440", "#d8dee9"],
		"cloud-dracula": ["#282a36", "#f8f8f2"],
		"cloud-ocean": ["#08111f", "#dbeafe"],
		"cloud-mono": ["#101010", "#e7e7e7"],
		"cloud-contrast": ["#000000", "#ffffff"],
	};
	return themes[themeName] || themes["cloud-black-gray"] || themes["cloud-dark"];
}

export function createEditorController(options) {
	const groups = {
		primary: {
			host: options.host,
			fallback: options.fallback,
			editor: null,
			applyingValue: false,
		},
		secondary: {
			host: options.secondaryHost,
			fallback: options.secondaryFallback,
			editor: null,
			applyingValue: false,
		},
	};

	const controller = {
		ready: false,
		isSplit: false,
		activeGroup: "primary",
		get editor() { return groups.primary.editor; },
		isApplying(group = this.activeGroup) { return !!groups[group]?.applyingValue; },
		getValue(group = this.activeGroup) {
			const target = groups[group] || groups.primary;
			return this.ready && target.editor ? target.editor.getValue() : target.fallback.value;
		},
		getViewState(group = this.activeGroup) {
			const target = groups[group] || groups.primary;

			if (this.ready && target.editor) {
				return {
					type: "monaco",
					position: target.editor.getPosition(),
					scrollTop: target.editor.getScrollTop(),
					scrollLeft: target.editor.getScrollLeft(),
				};
			}

			return {
				type: "fallback",
				selectionStart: target.fallback.selectionStart || 0,
				selectionEnd: target.fallback.selectionEnd || 0,
				scrollTop: target.fallback.scrollTop || 0,
				scrollLeft: target.fallback.scrollLeft || 0,
			};
		},
		restoreViewState(viewState, group = this.activeGroup) {
			const target = groups[group] || groups.primary;

			if (!viewState) {
				this.resetViewState(group);
				return;
			}

			if (this.ready && target.editor && viewState.type === "monaco") {
				const model = target.editor.getModel();
				const maxLine = model ? model.getLineCount() : 1;
				const rawPosition = viewState.position || { lineNumber: 1, column: 1 };
				const safeLine = Math.max(1, Math.min(maxLine, Number(rawPosition.lineNumber) || 1));
				const maxColumn = model ? model.getLineMaxColumn(safeLine) : 1;
				const safeColumn = Math.max(1, Math.min(maxColumn, Number(rawPosition.column) || 1));
				const safePosition = { lineNumber: safeLine, column: safeColumn };

				const scrollTop = Math.max(0, Number(viewState.scrollTop) || 0);
				const scrollLeft = Math.max(0, Number(viewState.scrollLeft) || 0);
				const applyState = () => {
					target.editor.setPosition(safePosition);
					target.editor.setScrollTop(scrollTop);
					target.editor.setScrollLeft(scrollLeft);
				};
				applyState();
				requestAnimationFrame(applyState);
				setTimeout(applyState, 40);
				setTimeout(applyState, 160);
				return;
			}

			const textLength = target.fallback.value.length;
			target.fallback.selectionStart = Math.min(textLength, Math.max(0, viewState.selectionStart || 0));
			target.fallback.selectionEnd = Math.min(textLength, Math.max(0, viewState.selectionEnd || 0));
			target.fallback.scrollTop = viewState.scrollTop || 0;
			target.fallback.scrollLeft = viewState.scrollLeft || 0;
		},
		resetViewState(group = this.activeGroup) {
			const target = groups[group] || groups.primary;

			if (this.ready && target.editor) {
				const firstPosition = { lineNumber: 1, column: 1 };
				target.editor.setPosition(firstPosition);
				target.editor.setScrollTop(0);
				target.editor.setScrollLeft(0);
				target.editor.revealPositionNearTop(firstPosition);
				return;
			}

			target.fallback.selectionStart = 0;
			target.fallback.selectionEnd = 0;
			target.fallback.scrollTop = 0;
			target.fallback.scrollLeft = 0;
		},
		setValue(value, group = this.activeGroup) {
			const target = groups[group] || groups.primary;
			target.applyingValue = true;
			if (this.ready && target.editor) {
				target.editor.setValue(value || "");
				const firstPosition = { lineNumber: 1, column: 1 };
				target.editor.setPosition(firstPosition);
				target.editor.setScrollTop(0);
				target.editor.setScrollLeft(0);
			}
			target.fallback.value = value || "";
			target.fallback.selectionStart = 0;
			target.fallback.selectionEnd = 0;
			target.fallback.scrollTop = 0;
			target.fallback.scrollLeft = 0;
			setTimeout(() => { target.applyingValue = false; }, 0);
		},
		focus(group = this.activeGroup) {
			const target = groups[group] || groups.primary;
			if (this.ready && target.editor) target.editor.focus();
			else target.fallback.focus();
		},
		focusLine(lineNumber, group = this.activeGroup) {
			const target = groups[group] || groups.primary;
			const line = Math.max(1, Number(lineNumber) || 1);
			if (this.ready && target.editor) {
				target.editor.revealLineInCenter(line);
				target.editor.setPosition({ lineNumber: line, column: 1 });
				target.editor.focus();
			} else {
				target.fallback.focus();
			}
		},
		foldAll(group = this.activeGroup) {
			const target = groups[group] || groups.primary;
			if (this.ready && target.editor) {
				target.editor.trigger("forge", "editor.foldAll", {});
				target.editor.focus();
			}
		},
		unfoldAll(group = this.activeGroup) {
			const target = groups[group] || groups.primary;
			if (this.ready && target.editor) {
				target.editor.trigger("forge", "editor.unfoldAll", {});
				target.editor.focus();
			}
		},
		layout() {
			for (const groupName of Object.keys(groups)) {
				const editor = groups[groupName].editor;
				if (editor) editor.layout();
			}
		},
		setSplit(enabled) {
			this.isSplit = !!enabled;
			if (options.shell) options.shell.classList.toggle("split", this.isSplit);
			if (!this.isSplit) this.activeGroup = "primary";
			setTimeout(() => {
				for (const groupName of Object.keys(groups)) {
					const editor = groups[groupName].editor;
					if (editor) editor.layout();
				}
			}, 20);
		},
		applySettings(settings) {
			const [background, color] = getFallbackTheme(settings.editorTheme || "cloud-dark");
			for (const groupName of Object.keys(groups)) {
				const target = groups[groupName];
				target.fallback.style.fontFamily = settings.fontFamily;
				target.fallback.style.fontSize = settings.fontSize + "px";
				target.fallback.style.background = background;
				target.fallback.style.color = color;
				if (this.ready && target.editor) {
					target.editor.updateOptions({
						fontFamily: settings.fontFamily,
						fontSize: settings.fontSize,
						wordWrap: settings.wordWrap,
						minimap: { enabled: !!settings.minimap },
					});
					setTimeout(() => target.editor.layout(), 20);
				}
			}
			if (this.ready && window.monaco) monaco.editor.setTheme(settings.editorTheme || "cloud-dark");
		},
	};

	for (const groupName of Object.keys(groups)) {
		const target = groups[groupName];
		target.fallback.style.display = "block";
		target.fallback.addEventListener("input", () => options.onChange(groupName));
		target.fallback.addEventListener("keydown", event => options.onFallbackKeyDown(event, groupName));
		target.fallback.addEventListener("focus", () => { controller.activeGroup = groupName; options.onActiveGroup?.(groupName); });
	}

	controller.applySettings(options.settings);

	if (!window.require) return controller;

	try {
		window.require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs" } });
		window.require(["vs/editor/editor.main"], () => {
			defineLuaSupport(monaco);
			defineThemes(monaco);
			registerCompletions(monaco);

			for (const groupName of Object.keys(groups)) {
				const target = groups[groupName];
				target.editor = monaco.editor.create(target.host, {
					value: target.fallback.value,
					language: "lua",
					theme: options.settings.editorTheme || "cloud-dark",
					automaticLayout: true,
					fontFamily: options.settings.fontFamily,
					fontSize: options.settings.fontSize,
					wordWrap: options.settings.wordWrap,
					minimap: { enabled: !!options.settings.minimap },
					tabSize: 4,
					insertSpaces: false,
					formatOnPaste: true,
					formatOnType: true,
					autoClosingBrackets: "always",
					autoClosingQuotes: "always",
					tabCompletion: "on",
					snippetSuggestions: "top",
					suggestOnTriggerCharacters: true,
					quickSuggestions: { other: true, comments: false, strings: true },
					acceptSuggestionOnEnter: "on",
					suggestSelection: "first",
					wordBasedSuggestions: "off",
					suggest: { showIcons: true, preview: true, previewMode: "prefix", showSnippets: true, showStatusBar: true, showInlineDetails: false, showMethods: true, showFunctions: true, showClasses: true, showWords: true, insertMode: "replace", selectionMode: "always", localityBonus: true },
				});

				target.editor.onDidChangeModelContent(() => options.onChange(groupName));
				target.editor.onDidChangeCursorPosition(event => options.onCursor(event.position, groupName));
				target.editor.onDidFocusEditorText(() => { controller.activeGroup = groupName; options.onActiveGroup?.(groupName); });
				target.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => options.onSave(groupName));
				target.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => options.onDuplicate?.(groupName));
				target.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyW, () => options.onClose(groupName));
				target.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyE, () => options.onFoldAll?.(groupName));
				target.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE, () => options.onUnfoldAll?.(groupName));
				target.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => options.onCreate(groupName));
				target.editor.addCommand(monaco.KeyCode.F2, () => options.onRename?.(groupName));
				target.fallback.style.display = "none";
			}

			controller.ready = true;
			controller.applySettings(options.settings);
		});
	} catch (error) {
		for (const groupName of Object.keys(groups)) groups[groupName].fallback.style.display = "block";
	}

	return controller;
}
