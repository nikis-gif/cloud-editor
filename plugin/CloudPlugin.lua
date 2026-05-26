local HttpService = game:GetService("HttpService")
local ScriptEditorService = game:GetService("ScriptEditorService")
local RunService = game:GetService("RunService")
local LogService = game:GetService("LogService")
local ScriptContext = game:GetService("ScriptContext")

local PLUGIN_NAME = "Cloud"
local WIDGET_ID = "Cloud_VSCodeBridge"
local LOCAL_BASE_URL = "http://localhost:3000"
local CLOUD_BASE_URL = "https://cloud-editor-03s5.onrender.com"
local ITEM_ID_ATTRIBUTE = "CloudItemId"
local LEGACY_ITEM_ID_ATTRIBUTE = "ForgeItemId"
local OLD_LEGACY_ITEM_ID_ATTRIBUTE = "StudioBridgeItemId"
local BRIDGE_ATTRIBUTE = "CloudManagedRuntimeBridge"
local RUNTIME_REMOTE_NAME = "__CloudOutputRemote"
local RUNTIME_SERVER_SCRIPT_NAME = "__CloudOutputServerBridge"
local RUNTIME_CLIENT_SCRIPT_NAME = "__CloudOutputClientBridge"
local AUTO_PULL_INTERVAL = 0.75
local AUTO_UPLOAD_INTERVAL = 8
local REQUEST_ATTEMPTS = 2
local REQUEST_RETRY_DELAY = 0.25
local SCAN_YIELD_BUDGET = 220
local OUTPUT_FLUSH_INTERVAL = 1
local OUTPUT_BATCH_LIMIT = 120

local toolbar = plugin:CreateToolbar(PLUGIN_NAME)
local button = toolbar:CreateButton("Cloud_Open", "Open Cloud", "rbxassetid://136661669872868", "Cloud")
local widgetInfo = DockWidgetPluginGuiInfo.new(Enum.InitialDockState.Right, false, false, 420, 620, 340, 420)
local widget = plugin:CreateDockWidgetPluginGui(WIDGET_ID, widgetInfo)
widget.Title = PLUGIN_NAME

local function service(name)
	local ok, result = pcall(function()
		return game:GetService(name)
	end)
	return ok and result or nil
end

local StarterPlayer = service("StarterPlayer")
local allowedRoots = {
	{ name = "Workspace", instance = workspace },
	{ name = "Lighting", instance = service("Lighting") },
	{ name = "MaterialService", instance = service("MaterialService") },
	{ name = "ReplicatedFirst", instance = service("ReplicatedFirst") },
	{ name = "ReplicatedStorage", instance = service("ReplicatedStorage") },
	{ name = "ServerScriptService", instance = service("ServerScriptService") },
	{ name = "ServerStorage", instance = service("ServerStorage") },
	{ name = "StarterGui", instance = service("StarterGui") },
	{ name = "StarterPack", instance = service("StarterPack") },
	{ name = "StarterPlayer", instance = StarterPlayer },
	{ name = "Teams", instance = service("Teams") },
	{ name = "SoundService", instance = service("SoundService") },
	{ name = "TextChatService", instance = service("TextChatService") }
}

local scriptClasses = {
	Script = true,
	LocalScript = true,
	ModuleScript = true
}

local creatableClasses = {
	Folder = true,
	Script = true,
	LocalScript = true,
	ModuleScript = true
}

local session = {
	active = false,
	id = nil,
	secret = nil,
	createdAt = nil
}

local state = {
	baseUrl = CLOUD_BASE_URL,
	connectionMode = "Cloud",
	apiStatus = "Not connected",
	statusColor = nil,
	lastAction = "Idle",
	scanCount = 0,
	lastUploadAt = nil,
	lastProjectHash = nil,
	lastRevision = 0,
	autoEnabled = false,
	wasAutoBeforePlay = false,
	workerRunning = false,
	networkBusy = false,
	playPaused = false,
	resolving = false,
	secretVisible = false,
	outputBusy = false,
	lastOutputFlushAt = 0,
	outputWorkerRunning = false
}

local scannedItems = {}
local scannedById = {}
local outputBuffer = {}
local outputConnections = {}
local outputSeen = {}
local ui = {}

local theme = {
	background = Color3.fromRGB(30, 30, 30),
	sidebar = Color3.fromRGB(37, 37, 38),
	panel = Color3.fromRGB(45, 45, 45),
	input = Color3.fromRGB(24, 24, 24),
	border = Color3.fromRGB(62, 62, 66),
	text = Color3.fromRGB(204, 204, 204),
	muted = Color3.fromRGB(150, 150, 150),
	accent = Color3.fromRGB(0, 122, 204),
	success = Color3.fromRGB(137, 209, 133),
	warning = Color3.fromRGB(204, 167, 0),
	danger = Color3.fromRGB(244, 135, 113)
}

local function create(className, properties, children)
	local instance = Instance.new(className)
	for key, value in pairs(properties or {}) do
		instance[key] = value
	end
	for _, child in ipairs(children or {}) do
		child.Parent = instance
	end
	return instance
end

local function corner(radius)
	return create("UICorner", { CornerRadius = UDim.new(0, radius or 4) })
end

local function stroke(color, thickness)
	return create("UIStroke", { Color = color or theme.border, Thickness = thickness or 1 })
end

local function padding(left, right, top, bottom)
	return create("UIPadding", {
		PaddingLeft = UDim.new(0, left or 0),
		PaddingRight = UDim.new(0, right or 0),
		PaddingTop = UDim.new(0, top or 0),
		PaddingBottom = UDim.new(0, bottom or 0)
	})
end

local function label(text, height, color, font)
	return create("TextLabel", {
		Size = UDim2.new(1, 0, 0, height or 22),
		BackgroundTransparency = 1,
		Text = text,
		TextColor3 = color or theme.text,
		TextSize = 13,
		Font = font or Enum.Font.Gotham,
		TextXAlignment = Enum.TextXAlignment.Left,
		TextYAlignment = Enum.TextYAlignment.Center,
		TextWrapped = true
	})
end

local function buttonControl(text, color)
	return create("TextButton", {
		Size = UDim2.new(1, 0, 0, 34),
		BackgroundColor3 = color or theme.panel,
		BorderSizePixel = 0,
		Text = text,
		TextColor3 = theme.text,
		TextSize = 12,
		Font = Enum.Font.GothamMedium,
		AutoButtonColor = true
	}, { corner(4), stroke(theme.border, 1) })
end

local function textBox(text, height, editable)
	return create("TextBox", {
		Size = UDim2.new(1, 0, 0, height or 34),
		BackgroundColor3 = theme.input,
		BorderSizePixel = 0,
		Text = text or "",
		TextColor3 = theme.text,
		PlaceholderColor3 = theme.muted,
		TextSize = 12,
		Font = Enum.Font.Code,
		TextXAlignment = Enum.TextXAlignment.Left,
		TextYAlignment = Enum.TextYAlignment.Center,
		ClearTextOnFocus = false,
		TextEditable = editable ~= false
	}, { corner(4), stroke(theme.border, 1), padding(8, 8, 0, 0) })
end

local function normalizeBaseUrl(value)
	local result = tostring(value or ""):gsub("%s+", "")
	while result:sub(-1) == "/" do
		result = result:sub(1, -2)
	end
	return result
end

local function hashString(value)
	value = tostring(value or "")
	local hash = 5381
	for index = 1, #value do
		hash = ((hash * 33) + string.byte(value, index)) % 4294967296
	end
	return string.format("%08X", hash)
end

local function generateSessionId()
	local guid = HttpService:GenerateGUID(false):gsub("-", ""):upper()
	return "SB-" .. guid:sub(1, 8)
end

local function generateSecret()
	return HttpService:GenerateGUID(false) .. "-" .. HttpService:GenerateGUID(false)
end

local function isScript(instance)
	return instance and scriptClasses[instance.ClassName] == true
end

local function isFolder(instance)
	return instance and instance.ClassName == "Folder"
end

local function canSync()
	local ok, running = pcall(function()
		return RunService:IsRunning()
	end)
	if ok and running then
		return false
	end
	local editOk, edit = pcall(function()
		return RunService:IsEdit()
	end)
	return not editOk or edit == true
end

local function isPlayModeActive()
	return not canSync()
end

local function markCloudManaged(instance)
	if not instance then return end
	pcall(function()
		instance:SetAttribute(BRIDGE_ATTRIBUTE, true)
	end)
end

local function isCloudManaged(instance)
	local current = instance
	while current and current ~= game do
		local ok, value = pcall(function()
			return current:GetAttribute(BRIDGE_ATTRIBUTE)
		end)
		if ok and value == true then
			return true
		end
		current = current.Parent
	end
	return false
end

local function setLastAction(value)
	state.lastAction = tostring(value or "Idle")
end

local function getRootByName(rootName)
	for _, root in ipairs(allowedRoots) do
		if root.name == rootName then
			return root.instance
		end
	end
	return nil
end

local function getRelativePath(root, instance)
	local names = {}
	local current = instance
	while current and current ~= root do
		table.insert(names, 1, current.Name)
		current = current.Parent
	end
	return table.concat(names, "/")
end

local function getParentPath(path)
	local parts = string.split(tostring(path or ""), "/")
	table.remove(parts, #parts)
	return table.concat(parts, "/")
end

local function getNameFromPath(path)
	local parts = string.split(tostring(path or ""), "/")
	return parts[#parts] or tostring(path or "")
end

local function getFolderDisplayPath(root, scriptInstance)
	local folders = {}
	local current = scriptInstance.Parent
	while current and current ~= root do
		if isFolder(current) then
			table.insert(folders, 1, current.Name)
		end
		current = current.Parent
	end
	return table.concat(folders, "/")
end

local function joinPath(parent, name)
	parent = tostring(parent or "")
	name = tostring(name or "")
	if parent == "" then
		return name
	end
	return parent .. "/" .. name
end

local function readItemId(instance)
	local value = nil
	pcall(function()
		value = instance:GetAttribute(ITEM_ID_ATTRIBUTE)
	end)
	if typeof(value) ~= "string" or value == "" then
		pcall(function()
			value = instance:GetAttribute(LEGACY_ITEM_ID_ATTRIBUTE)
		end)
	end
	if typeof(value) ~= "string" or value == "" then
		pcall(function()
			value = instance:GetAttribute(OLD_LEGACY_ITEM_ID_ATTRIBUTE)
		end)
	end
	if typeof(value) == "string" and value ~= "" then
		pcall(function()
			instance:SetAttribute(ITEM_ID_ATTRIBUTE, value)
		end)
		return value
	end
	return nil
end

local function setItemId(instance, itemId)
	if instance and typeof(itemId) == "string" and itemId ~= "" then
		pcall(function()
			instance:SetAttribute(ITEM_ID_ATTRIBUTE, itemId)
		end)
	end
end

local function ensureScriptItemId(instance, rootName, relativePath)
	local existing = readItemId(instance)
	if typeof(existing) ~= "string" or existing == "" then
		existing = "SCRIPT-" .. hashString(rootName .. "|" .. relativePath .. "|" .. instance.ClassName .. "|" .. HttpService:GenerateGUID(false))
		setItemId(instance, existing)
	end
	return existing
end

local function folderItemId(rootName, relativePath)
	return "FOLDER-" .. hashString(rootName .. "|" .. relativePath)
end

local function readScriptSource(instance)
	local ok, result = pcall(function()
		return ScriptEditorService:GetEditorSource(instance)
	end)
	if ok and typeof(result) == "string" then
		return result, nil
	end
	local fallbackOk, fallback = pcall(function()
		return instance.Source
	end)
	if fallbackOk and typeof(fallback) == "string" then
		return fallback, nil
	end
	return nil, tostring(result or fallback)
end

local function updateScriptSource(instance, source)
	if not canSync() then
		return false, "Cloud is paused while Play Mode is running."
	end
	for attempt = 1, 3 do
		local ok, result = pcall(function()
			ScriptEditorService:UpdateSourceAsync(instance, function()
				return source
			end)
		end)
		if ok then
			return true, nil
		end
		if attempt < 3 then
			task.wait(0.12)
		else
			local fallbackOk, fallbackResult = pcall(function()
				instance.Source = source
			end)
			if fallbackOk then
				return true, nil
			end
			return false, tostring(result or fallbackResult)
		end
	end
	return false, "Source update failed."
end

local function findInstanceByRelativePath(rootName, relativePath)
	local root = getRootByName(rootName)
	if not root then return nil end
	relativePath = tostring(relativePath or "")
	if relativePath == "" then return root end
	local current = root
	for _, part in ipairs(string.split(relativePath, "/")) do
		if part ~= "" then
			current = current:FindFirstChild(part)
			if not current then return nil end
		end
	end
	return current
end

local function findInstanceByItemId(itemId)
	if typeof(itemId) ~= "string" or itemId == "" then return nil end
	local cached = scannedById[itemId]
	if cached and cached.instance and cached.instance.Parent then
		return cached.instance
	end
	for _, rootData in ipairs(allowedRoots) do
		local root = rootData.instance
		if root then
			local stack = { root }
			while #stack > 0 do
				local current = table.remove(stack)
				for _, child in ipairs(current:GetChildren()) do
					if not isCloudManaged(child) then
						local value = readItemId(child)
						if value == itemId then
							return child
						end
						table.insert(stack, child)
					end
				end
			end
		end
	end
	return nil
end

local function resolveParent(rootName, parentRelativePath, parentItemId)
	if typeof(parentItemId) == "string" and parentItemId ~= "" then
		local byId = findInstanceByItemId(parentItemId)
		if byId then return byId, nil end
	end
	local parent = findInstanceByRelativePath(rootName, parentRelativePath)
	if parent then return parent, nil end
	return nil, "Parent instance not found."
end

local function requestJsonAt(baseUrl, method, path, body, auth, attempts)
	baseUrl = normalizeBaseUrl(baseUrl)
	if baseUrl == "" then
		return false, nil, "API base URL is empty."
	end
	local lastError = nil
	for attempt = 1, attempts or REQUEST_ATTEMPTS do
		local headers = { ["Content-Type"] = "application/json" }
		if auth then
			headers["X-Cloud-Session"] = session.id or ""
			headers["X-Cloud-Secret"] = session.secret or ""
			headers["X-Forge-Session"] = session.id or ""
			headers["X-Forge-Secret"] = session.secret or ""
		end
		local options = { Url = baseUrl .. path, Method = method, Headers = headers }
		if body ~= nil then
			options.Body = HttpService:JSONEncode(body)
		end
		local ok, response = pcall(function()
			return HttpService:RequestAsync(options)
		end)
		if ok then
			local decoded = nil
			if response.Body and response.Body ~= "" then
				local decodeOk, result = pcall(function()
					return HttpService:JSONDecode(response.Body)
				end)
				if decodeOk then decoded = result end
			end
			if response.Success then
				return true, decoded, nil
			end
			lastError = "HTTP " .. tostring(response.StatusCode) .. " " .. tostring(response.StatusMessage)
			if typeof(decoded) == "table" and decoded.error then
				lastError ..= " - " .. tostring(decoded.error)
			end
		else
			lastError = tostring(response)
		end
		if attempt < (attempts or REQUEST_ATTEMPTS) then
			task.wait(REQUEST_RETRY_DELAY)
		end
	end
	return false, nil, lastError or "Request failed."
end

local function requestJson(method, path, body)
	if not canSync() then
		return false, nil, "Cloud is paused while Play Mode is running."
	end
	return requestJsonAt(state.baseUrl, method, path, body, true, REQUEST_ATTEMPTS)
end

local function requestOutput(path, body)
	local baseUrl = normalizeBaseUrl(state.baseUrl)
	if baseUrl == "" then
		baseUrl = CLOUD_BASE_URL
	end
	local headers = {
		["Content-Type"] = "application/json",
		["X-Cloud-Session"] = session.id or "",
		["X-Cloud-Secret"] = session.secret or ""
	}
	local options = { Url = baseUrl .. path, Method = "POST", Headers = headers, Body = HttpService:JSONEncode(body) }
	local ok, response = pcall(function()
		return HttpService:RequestAsync(options)
	end)
	return ok and response.Success
end

local function checkHealth(baseUrl)
	local ok, data = requestJsonAt(baseUrl, "GET", "/health", nil, false, 1)
	return ok and typeof(data) == "table" and data.ok == true
end

local function updateViews()
	if ui.status then
		if state.playPaused then
			ui.status.Text = "Paused"
			ui.status.TextColor3 = theme.warning
		elseif session.active then
			ui.status.Text = "Connected"
			ui.status.TextColor3 = theme.success
		else
			ui.status.Text = "Offline"
			ui.status.TextColor3 = theme.muted
		end
	end
	if ui.sessionBox then ui.sessionBox.Text = session.active and session.id or "Not created" end
	if ui.secretBox then ui.secretBox.Text = session.active and (state.secretVisible and session.secret or "Hidden") or "Not created" end
	if ui.endpointBox then ui.endpointBox.Text = state.baseUrl end
	if ui.apiStatus then ui.apiStatus.Text = state.apiStatus end
	if ui.mode then ui.mode.Text = state.connectionMode end
	if ui.stats then
		local upload = state.lastUploadAt and os.date("%H:%M:%S", state.lastUploadAt) or "Never"
		ui.stats.Text = "Scripts and folders: " .. tostring(state.scanCount) .. "\nRevision: " .. tostring(state.lastRevision) .. "\nLast upload: " .. upload .. "\nLast action: " .. state.lastAction
	end
	if ui.createButton then ui.createButton.Text = session.active and "Restart Session" or "Create Session" end
	if ui.endButton then ui.endButton.Visible = session.active end
end

local function resolveBestBaseUrl(silent)
	if state.resolving or not canSync() then return false end
	state.resolving = true
	if not silent then
		state.apiStatus = "Checking local app"
		updateViews()
	end
	if checkHealth(LOCAL_BASE_URL) then
		state.baseUrl = LOCAL_BASE_URL
		state.connectionMode = "Local App"
		state.apiStatus = "Connected to local app"
		setLastAction("Using local app")
		state.resolving = false
		updateViews()
		return true
	end
	if checkHealth(CLOUD_BASE_URL) then
		state.baseUrl = CLOUD_BASE_URL
		state.connectionMode = "Cloud"
		state.apiStatus = "Connected to cloud"
		setLastAction("Using cloud service")
		state.resolving = false
		updateViews()
		return true
	end
	state.baseUrl = CLOUD_BASE_URL
	state.connectionMode = "Cloud"
	state.apiStatus = "Connection failed"
	setLastAction("API unavailable")
	state.resolving = false
	updateViews()
	return false
end

local function scanProject()
	if not canSync() then return false, "Cloud is paused while Play Mode is running." end
	table.clear(scannedItems)
	table.clear(scannedById)
	local virtualFolders = {}
	local workCounter = 0
	local function budget()
		workCounter += 1
		if workCounter >= SCAN_YIELD_BUDGET then
			workCounter = 0
			task.wait()
		end
	end
	local function addFolder(rootName, relativePath)
		if relativePath == "" then return "" end
		local existing = virtualFolders[rootName .. "|" .. relativePath]
		if existing then return existing end
		local parts = string.split(relativePath, "/")
		local parentPath = ""
		local currentPath = ""
		local parentId = ""
		for _, part in ipairs(parts) do
			currentPath = joinPath(currentPath, part)
			local key = rootName .. "|" .. currentPath
			local folderId = virtualFolders[key]
			if not folderId then
				folderId = folderItemId(rootName, currentPath)
				virtualFolders[key] = folderId
				local folderItem = {
					fileId = folderId,
					itemId = folderId,
					parentItemId = parentId,
					name = part,
					className = "Folder",
					kind = "folder",
					root = rootName,
					relativePath = currentPath,
					parentRelativePath = parentPath,
					path = rootName .. "." .. currentPath:gsub("/", "."),
					instancePath = currentPath,
					source = "",
					sourceLength = 0,
					sourceHash = hashString("Folder|" .. rootName .. "|" .. currentPath)
				}
				table.insert(scannedItems, folderItem)
				scannedById[folderId] = folderItem
			end
			parentPath = currentPath
			parentId = folderId
		end
		return parentId
	end
	for _, rootData in ipairs(allowedRoots) do
		local root = rootData.instance
		if root then
			local stack = { root }
			while #stack > 0 do
				if not canSync() then return false, "Cloud is paused while Play Mode is running." end
				local current = table.remove(stack)
				for _, child in ipairs(current:GetChildren()) do
					budget()
					if not isCloudManaged(child) then
						if isScript(child) then
							local actualPath = getRelativePath(root, child)
							local folderPath = getFolderDisplayPath(root, child)
							local displayPath = joinPath(folderPath, child.Name)
							local itemId = ensureScriptItemId(child, rootData.name, actualPath)
							local parentId = addFolder(rootData.name, folderPath)
							local source = readScriptSource(child) or ""
							local item = {
								fileId = itemId,
								itemId = itemId,
								parentItemId = parentId,
								name = child.Name,
								className = child.ClassName,
								kind = "script",
								root = rootData.name,
								relativePath = displayPath,
								parentRelativePath = folderPath,
								path = rootData.name .. "." .. displayPath:gsub("/", "."),
								instancePath = actualPath,
								source = source,
								sourceLength = #source,
								sourceHash = hashString(source),
								updatedAt = DateTime.now().UnixTimestampMillis,
								instance = child
							}
							table.insert(scannedItems, item)
							scannedById[itemId] = item
						else
							table.insert(stack, child)
						end
					end
				end
			end
		end
	end
	table.sort(scannedItems, function(a, b)
		if a.root == b.root then return a.relativePath < b.relativePath end
		return a.root < b.root
	end)
	state.scanCount = #scannedItems
	updateViews()
	return true, nil
end

local function buildPayload()
	local ok, scanError = scanProject()
	if not ok then return false, scanError end
	local items = {}
	local hashParts = {}
	for _, item in ipairs(scannedItems) do
		local clean = {
			fileId = item.fileId,
			itemId = item.itemId,
			parentItemId = item.parentItemId or "",
			name = item.name,
			className = item.className,
			kind = item.kind,
			root = item.root,
			relativePath = item.relativePath,
			parentRelativePath = item.parentRelativePath or "",
			path = item.path,
			instancePath = item.instancePath or item.relativePath,
			source = item.source or "",
			sourceLength = item.sourceLength or 0,
			sourceHash = item.sourceHash or hashString(item.source or ""),
			updatedAt = item.updatedAt or DateTime.now().UnixTimestampMillis
		}
		table.insert(items, clean)
		table.insert(hashParts, table.concat({ clean.itemId, clean.parentItemId, clean.root, clean.relativePath, clean.instancePath, clean.className, clean.sourceHash }, ":"))
	end
	table.sort(hashParts)
	local projectHash = hashString(table.concat(hashParts, "|"))
	return true, nil, { sessionId = session.id, projectHash = projectHash, items = items, files = items, itemsCount = #items, filesCount = #items }
end

local function uploadProject(force)
	if not session.active or state.networkBusy and not force then return false end
	local ok, buildError, payload = buildPayload()
	if not ok then
		state.apiStatus = "Build failed"
		setLastAction(buildError)
		updateViews()
		return false
	end
	if not force and state.lastProjectHash == payload.projectHash then
		return true
	end
	local success, data, requestError = requestJson("POST", "/sessions/upload", payload)
	if not success then
		state.apiStatus = "Upload failed"
		setLastAction(requestError)
		updateViews()
		return false
	end
	state.lastProjectHash = payload.projectHash
	state.lastUploadAt = os.time()
	if typeof(data) == "table" and typeof(data.lastRevision) == "number" then
		state.lastRevision = math.max(state.lastRevision, data.lastRevision)
	end
	state.apiStatus = "Workspace synced"
	setLastAction("Workspace uploaded")
	updateViews()
	return true
end

local function acknowledgeRevision(revision, ok, errorText)
	if typeof(revision) ~= "number" then return end
	requestJson("POST", "/sessions/" .. tostring(session.id) .. "/acks", { revision = revision, ok = ok ~= false, error = errorText or "" })
end

local function applySource(change)
	local itemId = tostring(change.itemId or change.fileId or "")
	local instance = itemId ~= "" and findInstanceByItemId(itemId) or nil
	if not instance and typeof(change.root) == "string" then
		instance = findInstanceByRelativePath(change.root, change.instancePath or change.relativePath)
	end
	if not instance or not isScript(instance) then
		return false, "Script instance not found."
	end
	setItemId(instance, itemId)
	local current = readScriptSource(instance)
	if current == change.source then return true, nil end
	return updateScriptSource(instance, tostring(change.source or ""))
end

local function applyCreate(change)
	local className = tostring(change.className or "")
	if not creatableClasses[className] then return false, "Unsupported class." end
	local rootName = tostring(change.root or "")
	local name = tostring(change.name or getNameFromPath(change.relativePath or ""))
	if name == "" then return false, "Name is empty." end
	local parentPath = tostring(change.parentRelativePath or getParentPath(change.relativePath or ""))
	local parent, parentError = resolveParent(rootName, parentPath, tostring(change.parentItemId or ""))
	if not parent then return false, parentError end
	local itemId = tostring(change.itemId or change.fileId or "")
	local existing = itemId ~= "" and findInstanceByItemId(itemId) or nil
	if existing then
		existing.Name = name
		if existing.Parent ~= parent then
			existing.Parent = parent
		end
		if isScript(existing) and typeof(change.source) == "string" then
			local ok, err = updateScriptSource(existing, change.source)
			if not ok then return false, err end
		end
		return true, nil
	end
	local instance = Instance.new(className)
	instance.Name = name
	setItemId(instance, itemId)
	local parentOk, parentResult = pcall(function()
		instance.Parent = parent
	end)
	if not parentOk then
		instance:Destroy()
		return false, tostring(parentResult)
	end
	if isScript(instance) and typeof(change.source) == "string" then
		local ok, err = updateScriptSource(instance, change.source)
		if not ok then return false, err end
	end
	return true, nil
end

local function applyDelete(change)
	local itemId = tostring(change.itemId or change.fileId or "")
	local instance = itemId ~= "" and findInstanceByItemId(itemId) or nil
	if not instance and typeof(change.root) == "string" then
		instance = findInstanceByRelativePath(change.root, change.instancePath or change.relativePath)
	end
	if not instance then return true, nil end
	for _, rootData in ipairs(allowedRoots) do
		if instance == rootData.instance then return false, "Cannot delete a root service." end
	end
	instance:Destroy()
	return true, nil
end

local function applyMove(change)
	local itemId = tostring(change.itemId or change.fileId or "")
	local instance = itemId ~= "" and findInstanceByItemId(itemId) or nil
	if not instance and typeof(change.fromRoot) == "string" then
		instance = findInstanceByRelativePath(change.fromRoot, change.fromRelativePath)
	end
	if not instance then return false, "Moved instance not found." end
	local parent, parentError = resolveParent(tostring(change.root or ""), tostring(change.parentRelativePath or ""), tostring(change.parentItemId or ""))
	if not parent then return false, parentError end
	local current = parent
	while current do
		if current == instance then return false, "Cannot move an instance inside itself." end
		current = current.Parent
	end
	instance.Name = tostring(change.name or getNameFromPath(change.relativePath or instance.Name))
	if instance.Parent ~= parent then
		instance.Parent = parent
	end
	setItemId(instance, itemId)
	return true, nil
end

local function applyChange(change)
	local changeType = tostring(change.type or "updateSource")
	if changeType == "updateSource" then return applySource(change) end
	if changeType == "createInstance" then return applyCreate(change) end
	if changeType == "deleteInstance" then return applyDelete(change) end
	if changeType == "moveInstance" then return applyMove(change) end
	return false, "Unsupported change type."
end

local function pullChanges(silent)
	if not session.active or not canSync() then return false end
	local path = "/sessions/" .. tostring(session.id) .. "/changes?after=" .. tostring(state.lastRevision)
	local success, data, requestError = requestJson("GET", path, nil)
	if not success then
		if not silent then
			state.apiStatus = "Pull failed"
			setLastAction(requestError)
			updateViews()
		end
		return false
	end
	local changes = typeof(data) == "table" and typeof(data.changes) == "table" and data.changes or {}
	table.sort(changes, function(a, b)
		return (a.revision or 0) < (b.revision or 0)
	end)
	local applied = 0
	for _, change in ipairs(changes) do
		if typeof(change.revision) == "number" and change.revision > state.lastRevision then
			local ok, errorText = applyChange(change)
			acknowledgeRevision(change.revision, ok, errorText)
			if not ok then
				state.apiStatus = "Apply failed"
				setLastAction(errorText)
				updateViews()
				return false
			end
			state.lastRevision = change.revision
			state.lastProjectHash = nil
			applied += 1
		end
	end
	if applied > 0 then
		scanProject()
		state.apiStatus = "Applied web changes"
		setLastAction("Applied " .. tostring(applied) .. " change(s)")
		updateViews()
	elseif typeof(data) == "table" and typeof(data.lastRevision) == "number" then
		state.lastRevision = math.max(state.lastRevision, data.lastRevision)
		updateViews()
	end
	return true
end

local function quote(value)
	return string.format("%q", tostring(value or ""))
end

local function runtimeServerSource()
	local source = [==[
local HttpService = game:GetService("HttpService")
local LogService = game:GetService("LogService")
local ScriptContext = game:GetService("ScriptContext")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local BASE_URL = __BASE_URL__
local SESSION_ID = __SESSION_ID__
local SECRET = __SECRET__
local REMOTE_NAME = __REMOTE_NAME__
local FLUSH_INTERVAL = 0.9
local MAX_BATCH = 120

local buffer = {}
local seen = {}
local busy = false
local lastFlush = 0

local remote = ReplicatedStorage:FindFirstChild(REMOTE_NAME)
if not remote or not remote:IsA("RemoteEvent") then
	if remote then remote:Destroy() end
	remote = Instance.new("RemoteEvent")
	remote.Name = REMOTE_NAME
	remote.Parent = ReplicatedStorage
end

local function levelFromType(messageType)
	local name = typeof(messageType) == "EnumItem" and messageType.Name or tostring(messageType or "")
	local lower = string.lower(name)
	if string.find(lower, "error") then return "error" end
	if string.find(lower, "warning") or string.find(lower, "warn") then return "warn" end
	if string.find(lower, "output") or string.find(lower, "message") then return "print" end
	return "info"
end

local function parseReference(message, stackTrace)
	local text = tostring(message or "") .. "\n" .. tostring(stackTrace or "")
	local path, line = text:match("Script ['\"]([^'\"]+)['\"], Line (%d+)")
	if not path then path, line = text:match("([%w_%.]+%.%w+):(%d+):") end
	if not path then path, line = text:match("([%w_%.]+), line (%d+)") end
	return path, tonumber(line)
end

local function queue(entry)
	if typeof(entry) ~= "table" then return end
	local message = tostring(entry.message or "")
	local stackTrace = tostring(entry.stackTrace or "")
	if message == "" and stackTrace == "" then return end
	local key = tostring(entry.level) .. "|" .. message .. "|" .. stackTrace
	if seen[key] then return end
	seen[key] = true
	entry.createdAt = DateTime.now().UnixTimestampMillis
	table.insert(buffer, entry)
	local count = 0
	for _ in pairs(seen) do count += 1 end
	if count > 600 then seen = {} end
end

local function flush()
	if busy or #buffer == 0 then return end
	busy = true
	lastFlush = os.clock()
	local entries = table.clone(buffer)
	table.clear(buffer)
	task.spawn(function()
		local ok = pcall(function()
			HttpService:RequestAsync({
				Url = BASE_URL .. "/sessions/" .. SESSION_ID .. "/output",
				Method = "POST",
				Headers = { ["Content-Type"] = "application/json", ["X-Cloud-Session"] = SESSION_ID, ["X-Cloud-Secret"] = SECRET },
				Body = HttpService:JSONEncode({ entries = entries })
			})
		end)
		if not ok then
			for _, entry in ipairs(entries) do table.insert(buffer, entry) end
		end
		busy = false
	end)
end

LogService.MessageOut:Connect(function(message, messageType)
	local scriptPath, line = parseReference(message, "")
	queue({ level = levelFromType(messageType), message = message, scriptPath = scriptPath or "Runtime", line = line, source = "Server" })
end)

pcall(function()
	ScriptContext.Error:Connect(function(message, stackTrace, scriptInstance)
		local scriptPath = typeof(scriptInstance) == "Instance" and scriptInstance:GetFullName() or "Runtime"
		local parsedPath, parsedLine = parseReference(message, stackTrace)
		queue({ level = "error", message = tostring(message or ""), stackTrace = tostring(stackTrace or ""), scriptPath = parsedPath or scriptPath, line = parsedLine, source = "Server" })
	end)
end)

remote.OnServerEvent:Connect(function(player, entry)
	if typeof(entry) ~= "table" then return end
	entry.source = "Client"
	entry.player = player and player.Name or "Player"
	queue(entry)
end)

task.spawn(function()
	while script.Parent do
		if #buffer >= MAX_BATCH or (#buffer > 0 and os.clock() - lastFlush >= FLUSH_INTERVAL) then flush() end
		task.wait(0.35)
	end
end)
]==]
	source = source:gsub("__BASE_URL__", quote(normalizeBaseUrl(state.baseUrl)))
	source = source:gsub("__SESSION_ID__", quote(session.id))
	source = source:gsub("__SECRET__", quote(session.secret))
	source = source:gsub("__REMOTE_NAME__", quote(RUNTIME_REMOTE_NAME))
	return source
end

local function runtimeClientSource()
	local source = [==[
local LogService = game:GetService("LogService")
local ScriptContext = game:GetService("ScriptContext")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local REMOTE_NAME = __REMOTE_NAME__
local remote = ReplicatedStorage:WaitForChild(REMOTE_NAME, 15)
if not remote or not remote:IsA("RemoteEvent") then return end

local seen = {}

local function levelFromType(messageType)
	local name = typeof(messageType) == "EnumItem" and messageType.Name or tostring(messageType or "")
	local lower = string.lower(name)
	if string.find(lower, "error") then return "error" end
	if string.find(lower, "warning") or string.find(lower, "warn") then return "warn" end
	if string.find(lower, "output") or string.find(lower, "message") then return "print" end
	return "info"
end

local function parseReference(message, stackTrace)
	local text = tostring(message or "") .. "\n" .. tostring(stackTrace or "")
	local path, line = text:match("Script ['\"]([^'\"]+)['\"], Line (%d+)")
	if not path then path, line = text:match("([%w_%.]+%.%w+):(%d+):") end
	if not path then path, line = text:match("([%w_%.]+), line (%d+)") end
	return path, tonumber(line)
end

local function send(entry)
	if typeof(entry) ~= "table" then return end
	local message = tostring(entry.message or "")
	local stackTrace = tostring(entry.stackTrace or "")
	if message == "" and stackTrace == "" then return end
	local key = tostring(entry.level) .. "|" .. message .. "|" .. stackTrace
	if seen[key] then return end
	seen[key] = true
	entry.createdAt = DateTime.now().UnixTimestampMillis
	entry.player = Players.LocalPlayer and Players.LocalPlayer.Name or "Player"
	remote:FireServer(entry)
end

LogService.MessageOut:Connect(function(message, messageType)
	local scriptPath, line = parseReference(message, "")
	send({ level = levelFromType(messageType), message = message, scriptPath = scriptPath or "Client", line = line, source = "Client" })
end)

pcall(function()
	ScriptContext.Error:Connect(function(message, stackTrace, scriptInstance)
		local scriptPath = typeof(scriptInstance) == "Instance" and scriptInstance:GetFullName() or "Client"
		local parsedPath, parsedLine = parseReference(message, stackTrace)
		send({ level = "error", message = tostring(message or ""), stackTrace = tostring(stackTrace or ""), scriptPath = parsedPath or scriptPath, line = parsedLine, source = "Client" })
	end)
end)
]==]
	source = source:gsub("__REMOTE_NAME__", quote(RUNTIME_REMOTE_NAME))
	return source
end

local function setScriptSourceNow(instance, source)
	local ok = pcall(function()
		ScriptEditorService:UpdateSourceAsync(instance, function()
			return source
		end)
	end)
	if not ok then
		pcall(function()
			instance.Source = source
		end)
	end
end

local function installRuntimeBridge()
	if not session.active or not canSync() then return end
	local replicatedStorage = service("ReplicatedStorage")
	local serverScriptService = service("ServerScriptService")
	local starterPlayer = service("StarterPlayer")
	local starterPlayerScripts = starterPlayer and starterPlayer:FindFirstChild("StarterPlayerScripts")
	if not replicatedStorage or not serverScriptService or not starterPlayerScripts then return end
	local remote = replicatedStorage:FindFirstChild(RUNTIME_REMOTE_NAME)
	if remote and not remote:IsA("RemoteEvent") then
		remote:Destroy()
		remote = nil
	end
	if not remote then
		remote = Instance.new("RemoteEvent")
		remote.Name = RUNTIME_REMOTE_NAME
		remote.Parent = replicatedStorage
	end
	markCloudManaged(remote)
	local serverScript = serverScriptService:FindFirstChild(RUNTIME_SERVER_SCRIPT_NAME)
	if serverScript and not serverScript:IsA("Script") then
		serverScript:Destroy()
		serverScript = nil
	end
	if not serverScript then
		serverScript = Instance.new("Script")
		serverScript.Name = RUNTIME_SERVER_SCRIPT_NAME
		serverScript.Parent = serverScriptService
	end
	markCloudManaged(serverScript)
	setScriptSourceNow(serverScript, runtimeServerSource())
	local clientScript = starterPlayerScripts:FindFirstChild(RUNTIME_CLIENT_SCRIPT_NAME)
	if clientScript and not clientScript:IsA("LocalScript") then
		clientScript:Destroy()
		clientScript = nil
	end
	if not clientScript then
		clientScript = Instance.new("LocalScript")
		clientScript.Name = RUNTIME_CLIENT_SCRIPT_NAME
		clientScript.Parent = starterPlayerScripts
	end
	markCloudManaged(clientScript)
	setScriptSourceNow(clientScript, runtimeClientSource())
end

local function removeRuntimeBridge()
	local replicatedStorage = service("ReplicatedStorage")
	local serverScriptService = service("ServerScriptService")
	local starterPlayer = service("StarterPlayer")
	local starterPlayerScripts = starterPlayer and starterPlayer:FindFirstChild("StarterPlayerScripts")
	local targets = {}
	if replicatedStorage then
		table.insert(targets, replicatedStorage:FindFirstChild(RUNTIME_REMOTE_NAME))
	end
	if serverScriptService then
		table.insert(targets, serverScriptService:FindFirstChild(RUNTIME_SERVER_SCRIPT_NAME))
	end
	if starterPlayerScripts then
		table.insert(targets, starterPlayerScripts:FindFirstChild(RUNTIME_CLIENT_SCRIPT_NAME))
	end
	for _, target in ipairs(targets) do
		if target and isCloudManaged(target) then
			target:Destroy()
		end
	end
end

local function getOutputLevel(messageType)
	local name = typeof(messageType) == "EnumItem" and messageType.Name or tostring(messageType or "")
	local lower = string.lower(name)
	if string.find(lower, "error") then return "error" end
	if string.find(lower, "warning") or string.find(lower, "warn") then return "warn" end
	if string.find(lower, "output") or string.find(lower, "message") then return "print" end
	return "info"
end

local function rootAndPath(instance)
	if not instance then return "", "" end
	for _, rootData in ipairs(allowedRoots) do
		local root = rootData.instance
		if root and (instance == root or instance:IsDescendantOf(root)) then
			return rootData.name, getRelativePath(root, instance)
		end
	end
	return "", instance:GetFullName()
end

local function extractLine(message, stackTrace)
	local text = tostring(message or "") .. "\n" .. tostring(stackTrace or "")
	return tonumber(text:match(":(%d+):") or text:match("Line (%d+)") or text:match("line%s+(%d+)"))
end

local function queueOutput(level, message, stackTrace, scriptInstance)
	if not session.active then return end
	local key = tostring(level) .. "|" .. tostring(message) .. "|" .. tostring(stackTrace)
	if outputSeen[key] then return end
	outputSeen[key] = os.clock()
	local rootName, relativePath = rootAndPath(scriptInstance)
	table.insert(outputBuffer, {
		createdAt = DateTime.now().UnixTimestampMillis,
		clock = os.date("%H:%M:%S"),
		level = tostring(level or "info"),
		message = tostring(message or ""),
		stackTrace = tostring(stackTrace or ""),
		scriptName = scriptInstance and scriptInstance.Name or "",
		scriptPath = rootName ~= "" and (rootName .. "." .. relativePath:gsub("/", ".")) or relativePath,
		root = rootName,
		relativePath = relativePath,
		line = extractLine(message, stackTrace),
		source = "Studio"
	})
	if #outputBuffer >= OUTPUT_BATCH_LIMIT then
		task.spawn(function()
			local entries = table.clone(outputBuffer)
			table.clear(outputBuffer)
			requestOutput("/sessions/" .. tostring(session.id) .. "/output", { entries = entries })
		end)
	end
end

local function flushOutput()
	if state.outputBusy or not session.active or #outputBuffer == 0 then return end
	state.outputBusy = true
	state.lastOutputFlushAt = os.clock()
	local entries = table.clone(outputBuffer)
	table.clear(outputBuffer)
	task.spawn(function()
		local ok = requestOutput("/sessions/" .. tostring(session.id) .. "/output", { entries = entries })
		if not ok then
			for _, entry in ipairs(entries) do table.insert(outputBuffer, entry) end
		end
		state.outputBusy = false
	end)
end

local function startOutputCapture()
	if #outputConnections > 0 then return end
	table.insert(outputConnections, LogService.MessageOut:Connect(function(message, messageType)
		queueOutput(getOutputLevel(messageType), message, "", nil)
	end))
	table.insert(outputConnections, ScriptContext.Error:Connect(function(...)
		local args = { ... }
		local message = ""
		local stackTrace = ""
		local scriptInstance = nil
		for _, value in ipairs(args) do
			if typeof(value) == "Instance" then
				scriptInstance = value
			elseif typeof(value) == "string" then
				if message == "" then message = value elseif stackTrace == "" then stackTrace = value else stackTrace ..= "\n" .. value end
			end
		end
		queueOutput("error", message, stackTrace, scriptInstance)
	end))
	if not state.outputWorkerRunning then
		state.outputWorkerRunning = true
		task.spawn(function()
			while #outputConnections > 0 do
				if session.active and #outputBuffer > 0 and os.clock() - state.lastOutputFlushAt >= OUTPUT_FLUSH_INTERVAL then flushOutput() end
				task.wait(0.35)
			end
			state.outputWorkerRunning = false
		end)
	end
end

local function stopOutputCapture()
	for _, connection in ipairs(outputConnections) do
		pcall(function() connection:Disconnect() end)
	end
	table.clear(outputConnections)
	table.clear(outputBuffer)
	table.clear(outputSeen)
	state.outputBusy = false
end

local function startAutomation()
	if not session.active or state.autoEnabled then
		updateViews()
		return
	end
	if not canSync() then
		state.playPaused = true
		setLastAction("Paused during Play Mode")
		updateViews()
		return
	end
	state.autoEnabled = true
	setLastAction("Automation started")
	updateViews()
	if state.workerRunning then return end
	state.workerRunning = true
	task.spawn(function()
		local nextPull = os.clock() + AUTO_PULL_INTERVAL
		local nextUpload = os.clock() + AUTO_UPLOAD_INTERVAL
		while state.autoEnabled do
			if not session.active then state.autoEnabled = false break end
			if not canSync() then
				state.wasAutoBeforePlay = true
				state.autoEnabled = false
				state.networkBusy = false
				state.playPaused = true
				setLastAction("Paused during Play Mode")
				updateViews()
				break
			end
			if not state.networkBusy then
				local now = os.clock()
				if now >= nextPull then
					state.networkBusy = true
					pullChanges(true)
					state.networkBusy = false
					nextPull = now + AUTO_PULL_INTERVAL
				end
				if now >= nextUpload then
					state.networkBusy = true
					if pullChanges(true) then uploadProject(false) end
					state.networkBusy = false
					nextUpload = now + AUTO_UPLOAD_INTERVAL
				end
			end
			task.wait(0.15)
		end
		state.workerRunning = false
		state.networkBusy = false
		updateViews()
	end)
end

local function createSession()
	if not canSync() then
		state.playPaused = true
		setLastAction("Cannot create session during Play Mode")
		updateViews()
		return
	end
	state.autoEnabled = false
	resolveBestBaseUrl(false)
	session.active = true
	session.id = generateSessionId()
	session.secret = generateSecret()
	session.createdAt = os.time()
	state.secretVisible = false
	state.lastRevision = 0
	state.lastProjectHash = nil
	state.lastUploadAt = nil
	setLastAction("Session created")
	installRuntimeBridge()
	startOutputCapture()
	queueOutput("info", "Cloud output mirror connected.", "", nil)
	updateViews()
	uploadProject(true)
	startAutomation()
end

local function endSession()
	removeRuntimeBridge()
	state.autoEnabled = false
	state.wasAutoBeforePlay = false
	session.active = false
	session.id = nil
	session.secret = nil
	session.createdAt = nil
	state.secretVisible = false
	state.lastRevision = 0
	state.lastProjectHash = nil
	state.lastUploadAt = nil
	state.scanCount = 0
	table.clear(scannedItems)
	table.clear(scannedById)
	stopOutputCapture()
	setLastAction("Session ended")
	updateViews()
end

local function syncNow()
	if not session.active or state.networkBusy then return end
	state.networkBusy = true
	if pullChanges(false) then uploadProject(true) end
	state.networkBusy = false
end

local function selectCopyText(text)
	if not ui.copyBox then return end
	ui.copyBox.Text = tostring(text or "")
	pcall(function()
		ui.copyBox:CaptureFocus()
		ui.copyBox.CursorPosition = 1
		ui.copyBox.SelectionStart = #ui.copyBox.Text + 1
	end)
end

local function buildWidget()
	widget:ClearAllChildren()
	table.clear(ui)
	local root = create("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = theme.background, BorderSizePixel = 0, Parent = widget }, { padding(12, 12, 12, 12) })
	local layout = create("UIListLayout", { Padding = UDim.new(0, 8), SortOrder = Enum.SortOrder.LayoutOrder, Parent = root })
	local title = label("Cloud", 30, theme.text, Enum.Font.GothamBold)
	title.TextSize = 22
	title.LayoutOrder = 1
	title.Parent = root
	local subtitle = label("VS Code style cloud bridge for Roblox scripts.", 34, theme.muted, Enum.Font.Gotham)
	subtitle.TextSize = 12
	subtitle.LayoutOrder = 2
	subtitle.Parent = root
	local statusCard = create("Frame", { Size = UDim2.new(1, 0, 0, 70), BackgroundColor3 = theme.sidebar, BorderSizePixel = 0, LayoutOrder = 3, Parent = root }, { corner(4), stroke(theme.border, 1), padding(10, 10, 8, 8) })
	create("UIListLayout", { Padding = UDim.new(0, 4), Parent = statusCard })
	ui.status = label("Offline", 24, theme.muted, Enum.Font.GothamBold)
	ui.status.Parent = statusCard
	ui.apiStatus = label("Not connected", 22, theme.muted, Enum.Font.Gotham)
	ui.apiStatus.Parent = statusCard
	ui.mode = label("Cloud", 18, theme.muted, Enum.Font.Gotham)
	ui.mode.TextSize = 11
	ui.mode.Parent = statusCard
	ui.sessionBox = textBox("Not created", 34, false)
	ui.sessionBox.LayoutOrder = 4
	ui.sessionBox.Parent = root
	ui.secretBox = textBox("Not created", 34, false)
	ui.secretBox.LayoutOrder = 5
	ui.secretBox.Parent = root
	ui.copyBox = textBox("Select a value and press Ctrl+C.", 58, true)
	ui.copyBox.MultiLine = true
	ui.copyBox.TextYAlignment = Enum.TextYAlignment.Top
	ui.copyBox.LayoutOrder = 6
	ui.copyBox.Parent = root
	ui.endpointBox = textBox(state.baseUrl, 34, true)
	ui.endpointBox.LayoutOrder = 7
	ui.endpointBox.Parent = root
	ui.createButton = buttonControl("Create Session", theme.accent)
	ui.createButton.LayoutOrder = 8
	ui.createButton.Parent = root
	local row = create("Frame", { Size = UDim2.new(1, 0, 0, 34), BackgroundTransparency = 1, LayoutOrder = 9, Parent = root })
	create("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 6), Parent = row })
	local copyId = buttonControl("Copy ID", theme.panel)
	copyId.Size = UDim2.new(0.5, -3, 1, 0)
	copyId.Parent = row
	local copySecret = buttonControl("Copy Secret", theme.panel)
	copySecret.Size = UDim2.new(0.5, -3, 1, 0)
	copySecret.Parent = row
	local rowTwo = create("Frame", { Size = UDim2.new(1, 0, 0, 34), BackgroundTransparency = 1, LayoutOrder = 10, Parent = root })
	create("UIListLayout", { FillDirection = Enum.FillDirection.Horizontal, Padding = UDim.new(0, 6), Parent = rowTwo })
	local detect = buttonControl("Detect API", theme.panel)
	detect.Size = UDim2.new(0.5, -3, 1, 0)
	detect.Parent = rowTwo
	local sync = buttonControl("Sync Now", theme.accent)
	sync.Size = UDim2.new(0.5, -3, 1, 0)
	sync.Parent = rowTwo
	ui.endButton = buttonControl("End Session", Color3.fromRGB(80, 42, 40))
	ui.endButton.LayoutOrder = 11
	ui.endButton.Parent = root
	ui.stats = label("Scripts and folders: 0\nRevision: 0\nLast upload: Never\nLast action: Idle", 88, theme.muted, Enum.Font.Code)
	ui.stats.TextYAlignment = Enum.TextYAlignment.Top
	ui.stats.LayoutOrder = 12
	ui.stats.Parent = root
	ui.endpointBox.FocusLost:Connect(function()
		local value = normalizeBaseUrl(ui.endpointBox.Text)
		if value ~= "" then
			state.baseUrl = value
			state.connectionMode = value == LOCAL_BASE_URL and "Local App" or value == CLOUD_BASE_URL and "Cloud" or "Custom"
			setLastAction("Endpoint changed")
			updateViews()
		end
	end)
	ui.createButton.MouseButton1Click:Connect(createSession)
	ui.endButton.MouseButton1Click:Connect(endSession)
	copyId.MouseButton1Click:Connect(function()
		if session.active then
			selectCopyText(session.id)
		end
	end)
	copySecret.MouseButton1Click:Connect(function()
		if session.active then
			state.secretVisible = true
			selectCopyText(session.secret)
			updateViews()
		end
	end)
	detect.MouseButton1Click:Connect(function()
		resolveBestBaseUrl(false)
	end)
	sync.MouseButton1Click:Connect(syncNow)
	updateViews()
	task.spawn(function()
		task.wait(0.5)
		if canSync() and not session.active then resolveBestBaseUrl(true) end
	end)
end

local function updatePlayModePause()
	local running = isPlayModeActive()
	if running and not state.playPaused then
		state.playPaused = true
		state.networkBusy = false
		if state.autoEnabled then
			state.wasAutoBeforePlay = true
			state.autoEnabled = false
		end
		state.apiStatus = "Paused during Play Mode"
		setLastAction("Paused during Play Mode")
		updateViews()
	elseif not running and state.playPaused then
		state.playPaused = false
		setLastAction("Play stopped")
		if session.active and state.wasAutoBeforePlay then
			state.wasAutoBeforePlay = false
			startAutomation()
		else
			updateViews()
		end
	end
end

button.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)

widget:GetPropertyChangedSignal("Enabled"):Connect(function()
	button:SetActive(widget.Enabled)
end)

RunService.Heartbeat:Connect(function()
	if session.active and #outputBuffer > 0 and os.clock() - state.lastOutputFlushAt >= OUTPUT_FLUSH_INTERVAL then
		flushOutput()
	end
end)

task.spawn(function()
	while true do
		updatePlayModePause()
		task.wait(0.25)
	end
end)

buildWidget()
button:SetActive(widget.Enabled)
