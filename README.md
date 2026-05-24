# Cloud Editor Server

Cloud is an integrated development environment for Roblox with a web version, a desktop Electron app, and a Roblox plugin connection.

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

## Run locally

```bash
npm install
npm start
```

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
git tag v1.2.1
git push origin v1.2.1
```

The GitHub Action builds the Windows installer and uploads it to GitHub Releases.

## Download URL

```txt
https://github.com/nikis-gif/cloud-editor/releases/latest/download/Cloud-Setup.exe
```

## Roblox plugin

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
1.2.1
```
