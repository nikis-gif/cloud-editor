const path = require("path");

const ROOT_ORDER = [
	"Workspace",
	"Lighting",
	"MaterialService",
	"ReplicatedFirst",
	"ReplicatedStorage",
	"ServerScriptService",
	"ServerStorage",
	"StarterGui",
	"StarterPack",
	"StarterPlayer",
	"Teams",
	"SoundService",
	"TextChatService"
];

const MAX_BODY_SIZE = 24_000_000;
const MAX_OUTPUT_ENTRIES = 2000;
const MAX_CHANGE_ENTRIES = 1200;
const SCRIPT_CLASSES = new Set(["Script", "LocalScript", "ModuleScript"]);
const FOLDER_CLASSES = new Set(["Folder"]);
const CREATABLE_CLASSES = new Set(["Folder", "Script", "LocalScript", "ModuleScript"]);
const TRACKED_ROOTS = new Set(ROOT_ORDER);
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

module.exports = {
	ROOT_ORDER,
	MAX_BODY_SIZE,
	MAX_OUTPUT_ENTRIES,
	MAX_CHANGE_ENTRIES,
	SCRIPT_CLASSES,
	FOLDER_CLASSES,
	CREATABLE_CLASSES,
	TRACKED_ROOTS,
	PUBLIC_DIR
};
