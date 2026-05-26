(function () {
	function storageKey(fileId) {
		return "cloud.editor.viewState." + fileId;
	}

	function safeParse(value) {
		try {
			return JSON.parse(value);
		} catch (error) {
			return null;
		}
	}

	function defineLua(monaco) {
		monaco.languages.register({ id: "lua" });
		monaco.languages.setMonarchTokensProvider("lua", {
			keywords: ["and", "break", "do", "else", "elseif", "end", "false", "for", "function", "if", "in", "local", "nil", "not", "or", "repeat", "return", "then", "true", "until", "while"],
			operators: ["+", "-", "*", "/", "%", "^", "#", "==", "~=", "<=", ">=", "<", ">", "=", "(", ")", "{", "}", "[", "]", ";", ":", ",", ".", "..", "..."],
			symbols: /[=><!~?:&|+\-*\/\^%]+/,
			escapes: /\\(?:[abfnrtv\\\"']|\d{1,3})/,
			tokenizer: {
				root: [
					[/[a-zA-Z_]\w*/, { cases: { "@keywords": "keyword", "@default": "identifier" } }],
					[/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
					[/0[xX][0-9a-fA-F]+/, "number.hex"],
					[/\d+/, "number"],
					[/--\[\[/, "comment", "comment"],
					[/--.*$/, "comment"],
					[/"/, "string", "stringDouble"],
					[/'/, "string", "stringSingle"],
					[/@symbols/, { cases: { "@operators": "operator", "@default": "" } }]
				],
				comment: [[/[^\]]+/, "comment"], [/\]\]/, "comment", "@pop"], [/./, "comment"]],
				stringDouble: [[/[^\\"]+/, "string"], [/@escapes/, "string.escape"], [/\\./, "string.escape.invalid"], [/"/, "string", "@pop"]],
				stringSingle: [[/[^\\']+/, "string"], [/@escapes/, "string.escape"], [/\\./, "string.escape.invalid"], [/'/, "string", "@pop"]]
			}
		});
		monaco.languages.setLanguageConfiguration("lua", {
			comments: { lineComment: "--", blockComment: ["--[[", "]]" ] },
			brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
			autoClosingPairs: [{ open: "{", close: "}" }, { open: "[", close: "]" }, { open: "(", close: ")" }, { open: "\"", close: "\"" }, { open: "'", close: "'" }],
			folding: { markers: { start: /^\s*--\s*#region\b/, end: /^\s*--\s*#endregion\b/ } }
		});
	}

	function createEditor(host) {
		return new Promise((resolve, reject) => {
			if (!window.require) {
				reject(new Error("Monaco loader is unavailable."));
				return;
			}
			window.require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs" } });
			window.require(["vs/editor/editor.main"], function () {
				defineLua(monaco);
				monaco.editor.defineTheme("cloud-vscode", {
					base: "vs-dark",
					inherit: true,
					rules: [
						{ token: "keyword", foreground: "569cd6" },
						{ token: "string", foreground: "ce9178" },
						{ token: "number", foreground: "b5cea8" },
						{ token: "comment", foreground: "6a9955" },
						{ token: "operator", foreground: "d4d4d4" }
					],
					colors: {
						"editor.background": "#1e1e1e",
						"editor.foreground": "#d4d4d4",
						"editorLineNumber.foreground": "#858585",
						"editorLineNumber.activeForeground": "#c6c6c6",
						"editorCursor.foreground": "#aeafad",
						"editor.selectionBackground": "#264f78",
						"editor.inactiveSelectionBackground": "#3a3d41",
						"editorIndentGuide.background": "#404040",
						"editorIndentGuide.activeBackground": "#707070",
						"editorGutter.background": "#1e1e1e"
					}
				});
				const editor = monaco.editor.create(host, {
					value: "",
					language: "lua",
					theme: "cloud-vscode",
					automaticLayout: true,
					fontFamily: "Consolas, 'Courier New', monospace",
					fontSize: 14,
					lineHeight: 20,
					minimap: { enabled: true },
					scrollBeyondLastLine: false,
					smoothScrolling: true,
					cursorSmoothCaretAnimation: "on",
					bracketPairColorization: { enabled: true },
					guides: { bracketPairs: true, indentation: true },
					folding: true,
					foldingStrategy: "indentation",
					renderWhitespace: "selection",
					wordWrap: "off"
				});
				resolve({ monaco, editor });
			});
		});
	}

	function saveViewState(fileId, editor) {
		if (!fileId || !editor) return;
		const state = editor.saveViewState();
		if (!state) return;
		localStorage.setItem(storageKey(fileId), JSON.stringify(state));
	}

	function restoreViewState(fileId, editor) {
		const state = safeParse(localStorage.getItem(storageKey(fileId)) || "");
		if (state) editor.restoreViewState(state);
	}

	window.CloudEditor = {
		createEditor,
		saveViewState,
		restoreViewState
	};
}());
