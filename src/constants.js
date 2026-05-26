const path = require("path");

const ROOT_ORDER = [
	"Workspace",
<<<<<<< HEAD
	"Lighting",
	"MaterialService",
=======
	"Players",
	"Lighting",
	"MaterialService",
	"NetworkClient",
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
	"ReplicatedFirst",
	"ReplicatedStorage",
	"ServerScriptService",
	"ServerStorage",
	"StarterGui",
	"StarterPack",
	"StarterPlayer",
	"Teams",
	"SoundService",
<<<<<<< HEAD
	"TextChatService"
];

const MAX_BODY_SIZE = 24_000_000;
const MAX_OUTPUT_ENTRIES = 2000;
const MAX_CHANGE_ENTRIES = 1200;
const SCRIPT_CLASSES = new Set(["Script", "LocalScript", "ModuleScript"]);
const FOLDER_CLASSES = new Set(["Folder"]);
const CREATABLE_CLASSES = new Set(["Folder", "Script", "LocalScript", "ModuleScript"]);
const TRACKED_ROOTS = new Set(ROOT_ORDER);
=======
	"TextChatService",
];

const MAX_BODY_SIZE = 60_000_000;
const TRACKED_ROOTS = new Set(ROOT_ORDER);
const SCRIPT_CLASSES = new Set(["Script", "LocalScript", "ModuleScript"]);
const FOLDER_CLASSES = new Set(["Folder", "Configuration"]);
const CREATABLE_CLASSES = new Set(["Folder", "Configuration", "Script", "LocalScript", "ModuleScript"]);
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

module.exports = {
	ROOT_ORDER,
	MAX_BODY_SIZE,
<<<<<<< HEAD
	MAX_OUTPUT_ENTRIES,
	MAX_CHANGE_ENTRIES,
	SCRIPT_CLASSES,
	FOLDER_CLASSES,
	CREATABLE_CLASSES,
	TRACKED_ROOTS,
	PUBLIC_DIR
=======
	TRACKED_ROOTS,
	SCRIPT_CLASSES,
	FOLDER_CLASSES,
	CREATABLE_CLASSES,
	PUBLIC_DIR,
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
};
