# Cloud Editor VS Code Refactor

Cloud Editor VS Code Refactor is a script-only Roblox Studio cloud workspace with a VS Code style web interface, a lightweight Node HTTP server, terminal output mirroring, persistent Monaco view state, code folding persistence, codebase search, and click-to-line error navigation.

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:3000`, create a session in the Roblox Studio plugin, then paste the Session ID and Secret into the web UI.

## Plugin install

Copy `plugin/CloudPlugin.lua` into a Roblox Studio plugin source file or package it as a local plugin.

The plugin scans only scripts and folder paths that lead to scripts. Non-script objects are inspected only to discover descendants and are not replicated into the Cloud tree.

## Data structure

The plugin uploads `items`, where each item is either a `folder` or `script`. Script items include `source`, `sourceHash`, `instancePath`, `relativePath`, `root`, and stable `itemId` values. Folder items exist only when they lead to at least one script.
