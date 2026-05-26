<<<<<<< HEAD
# Cloud Editor VS Code Refactor

Cloud Editor VS Code Refactor is a script-only Roblox Studio cloud workspace with a VS Code style web interface, a lightweight Node HTTP server, terminal output mirroring, persistent Monaco view state, code folding persistence, codebase search, and click-to-line error navigation.
=======
# Cloud Editor Server

Cloud is an integrated development environment for game scripting with a web version, a desktop Electron app, and a plugin connection.

Repository:

```txt
https://github.com/nikis-gif/cloud-editor
```

Default cloud endpoint:

```txt
https://cloud-editor-03s5.onrender.com
```

Local endpoint:

```txt
http://localhost:3000
```
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b

## Run locally

```bash
npm install
npm start
```

<<<<<<< HEAD
Open `http://localhost:3000`, create a session in the Roblox Studio plugin, then paste the Session ID and Secret into the web UI.

## Plugin install

Copy `plugin/CloudPlugin.lua` into a Roblox Studio plugin source file or package it as a local plugin.

The plugin scans only scripts and folder paths that lead to scripts. Non-script objects are inspected only to discover descendants and are not replicated into the Cloud tree.

## Data structure

The plugin uploads `items`, where each item is either a `folder` or `script`. Script items include `source`, `sourceHash`, `instancePath`, `relativePath`, `root`, and stable `itemId` values. Folder items exist only when they lead to at least one script.
=======
Open:

```txt
http://localhost:3000
```

## Run the desktop app in development

```bash
npm install
npm run desktop
```

The desktop app starts Cloud locally on `localhost:3000`.

## Build the Windows installer locally

```bash
npm install
npm run build:win
```

The installer is generated at:

```txt
dist/Cloud-Setup.exe
```

## Publish a Windows release

Commit and push:

```bash
git add .
git commit -m "Initial Cloud release"
git push origin main
```

Create the first tag:

```bash
git tag v1.2.3
git push origin v1.2.3
```

The GitHub Action builds the Windows installer and uploads it to GitHub Releases.

## Download URL

```txt
https://github.com/nikis-gif/cloud-editor/releases/latest/download/Cloud-Setup.exe
```

## Game editor plugin

The plugin file is:

```txt
plugin/CloudPlugin.txt
```

The plugin checks this order:

```txt
1. http://localhost:3000
2. https://cloud-editor-03s5.onrender.com
```

If the Cloud desktop app is open, the plugin uses the local app. If not, it falls back to Render.

## Render setup

Create a new Render Web Service using this repository.

Recommended settings:

```txt
Runtime: Node
Build Command: npm install
Start Command: npm start
Branch: main
```

The server reads the Render port from `process.env.PORT` automatically.

## Discord Rich Presence

Application ID:

```txt
1507948057289822229
```

Large Image Key:

```txt
cloud_logo
```

## Version

```txt
1.2.3
```
>>>>>>> 69bc47020a791f87c5543f97783fb08a51cd3d4b
