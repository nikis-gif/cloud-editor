import { STORAGE } from "./config.js";
import { loadJson, saveJson } from "./helpers.js";

export const LANGUAGES = [
	{ code: "en", label: "English" },
	{ code: "pt-BR", label: "Português (Brasil)" },
	{ code: "es", label: "Español" },
	{ code: "fr", label: "Français" },
	{ code: "de", label: "Deutsch" },
	{ code: "it", label: "Italiano" },
	{ code: "ja", label: "日本語" },
	{ code: "ko", label: "한국어" },
	{ code: "zh-CN", label: "简体中文" },
	{ code: "ru", label: "Русский" },
];

export const TRANSLATIONS = {
	en: {
		brandSubtitle: "A complete integrated development environment for game scripting.",
		entryBrandSubtitle: "Game scripting workspace",
		entryLearn: "Learn",
		entryPlugin: "Plugin",
		entryHeroBadge: "Private workspace",
		entryHeroTitle: "Code in the cloud, without the noise.",
		entryHeroBody: "Connect your private session, open your project tree, and keep scripting in a clean workspace.",
		entryPreviewTitle: "What Cloud feels like",
		entryPreviewBody: "A cleaner editor surface, quick project access, and a smoother path from idea to script.",
		entryPreviewKicker: "Focused flow",
		entryFeatureOneTitle: "Live structure",
		entryFeatureOneBody: "Open the workspace tree, keep folders organized, and move between scripts without noise.",
		entryFeatureTwoTitle: "Built for longer sessions",
		entryFeatureTwoBody: "Clear hierarchy, calmer spacing, and a layout that stays readable while the project grows.",
		entryConnectBadge: "Connect",
		entryConnectTitle: "Enter Cloud",
		entryConnectBody: "Paste your Session ID and Hidden Secret to unlock the workspace.",
		entryFlowOne: "Start a session",
		entryFlowTwo: "Copy the credentials",
		entryFlowThree: "Enter Cloud",
		entrySessionLabel: "Session ID",
		entrySessionPlaceholder: "Paste session ID",
		entrySecretLabel: "Hidden Secret",
		entrySecretPlaceholder: "Paste hidden secret",
		entryConnectAction: "Enter Cloud",
		entryShortcutSave: "Ctrl + S saves the active script",
		entryShortcutSelect: "Shift + Click keeps multi-select easy",
		entryShortcutDelete: "Delete removes selected items",
		entryShortcutPaste: "Ctrl + C / X / V keeps scripts moving",
		entryGuideTitle: "Useful right away",
		entryGuideBody: "Everything here points to a real part of the workflow, so the screen feels full without feeling noisy.",
		entryGuideOneTitle: "Open scripts faster",
		entryGuideOneBody: "Use the explorer, tabs, project search, and split view to stay inside the same flow.",
		entryGuideTwoTitle: "Keep structure under control",
		entryGuideTwoBody: "Create, rename, move, duplicate, cut, copy, paste, and delete scripts or folders from one place.",
		entryGuideThreeTitle: "Stay in sync",
		entryGuideThreeBody: "Save changes, keep the workspace updated, and use the same session path during the whole coding cycle.",
		entryShortcutPanelTitle: "Everyday controls",
		entryShortcutPanelBody: "The most common actions stay close so the app feels easier to pick up.",
		entryShortcutGridSave: "Save the script you are editing.",
		entryShortcutGridSelect: "Select several scripts at once.",
		entryShortcutGridDelete: "Remove the selected scripts or folders.",
		entryShortcutGridPaste: "Copy, cut, and paste scripts into the workspace.",
		entryCtaTitle: "Need the setup steps?",
		entryCtaBody: "Use Learn if you need the setup steps again.",
		entryDownload: "Download app",
		entryLearnOpen: "Open Learn",
		entryPhraseOne: "Welcome to Cloud, ready to build?",
		entryPhraseTwo: "Open the session and keep your flow clean.",
		entryPhraseThree: "Select scripts, move faster, save often.",
		entryPhraseFour: "Less visual noise. More room to code.",
		learnPageKicker: "Learn",
		learnPageTitle: "How Cloud works",
		learnPageSubtitle: "A short setup guide for connecting your workspace and using the editor without friction.",
		learnSidebarTitle: "What Cloud is doing",
		learnSidebarBody: "Cloud keeps a private session between the app and your development environment, so your files stay inside one focused workflow.",
		learnSidebarQuickTitle: "Connect",
		learnSidebarQuickOne: "Open the plugin inside your game development environment.",
		learnSidebarQuickTwo: "Create a private session.",
		learnSidebarQuickThree: "Copy the Session ID and Hidden Secret.",
		learnSidebarKeysTitle: "Helpful shortcuts",
		learnKeyOne: "Save the active script.",
		learnKeyTwo: "Select multiple scripts in the explorer.",
		learnKeyThree: "Remove selected scripts or folders.",
		learnKeyFour: "Copy, cut, and paste selected scripts or folders.",
		learnHeroTitle: "A simple path from setup to script editing.",
		learnHeroBody: "If you are opening Cloud for the first time, follow these steps once. After that, most of the work becomes open, edit, save, and keep moving.",
		learnStepOneTitle: "Install Cloud",
		learnStepOneBody: "Use the desktop app for the cleanest flow, or the web version when you need quick access.",
		learnStepTwoTitle: "Open the plugin",
		learnStepTwoBody: "Launch the plugin in your development setup and generate a fresh private session.",
		learnStepThreeTitle: "Copy the credentials",
		learnStepThreeBody: "Take the Session ID and Hidden Secret together. You will need both before the workspace can load.",
		learnStepFourTitle: "Enter Cloud",
		learnStepFourBody: "Paste both values on the start screen and enter Cloud.",
		learnStepFiveTitle: "Build inside the workspace",
		learnStepFiveBody: "Open scripts, use tabs, split the editor, search the project, and keep your structure organized.",
		learnStepSixTitle: "Save and manage files",
		learnStepSixBody: "Use Ctrl + S to save and the multi-select, copy, cut, paste, and delete actions to manage scripts faster.",
		learnRoutineTitle: "A normal everyday routine",
		learnRoutineOne: "Connect once at the start of the session.",
		learnRoutineTwo: "Open the scripts you are actively working on.",
		learnRoutineThree: "Save often and let Cloud keep the workspace current.",
		learnRoutineFour: "Use Learn again whenever you want the setup steps nearby.",
		learnToolsTitle: "What you can manage inside Cloud",
		learnToolsOne: "Create new scripts and folders.",
		learnToolsTwo: "Rename, duplicate, move, and delete items.",
		learnToolsThree: "Copy, cut, and paste scripts across the workspace.",
		learnToolsFour: "Switch between tabs or open a split view when you need parallel editing.",
		learnPluginAction: "Open plugin page",
		downloadApp: "Download Cloud App",
		robloxPlugin: "Plugin",
		explorer: "Explorer",
		privateSession: "Private session",
		project: "Project",
		searchPlaceholder: "Search by name, class or path",
		noFileOpen: "No file open",
		filePathEmpty: "Connect to a private Cloud session and open a script.",
		search: "Search",
		closeSplit: "Close Split",
		save: "Save",
		ready: "Ready",
		footerHelp: "Ctrl+W close tab · Ctrl+1-9 switch tabs · Ctrl+Shift+E fold script · Ctrl+E unfold script",
		connectionTitle: "Connection",
		secureTitle: "Connect to your workspace.",
		secureText: "Your session ID and secret are required before Cloud can read or save files.",
		connectedKicker: "Workspace connected",
		connectedTitle: "Cloud is ready",
		connectedHelp: "Use Forget only when you want to disconnect this browser from the current session.",
		done: "Done",
		sessionId: "Session ID",
		sessionSecret: "Session Secret",
		pasteSessionId: "Paste session ID",
		pasteSessionSecret: "Paste session secret",
		forget: "Forget",
		cancel: "Cancel",
		connect: "Connect",
		newInstance: "New Instance",
		name: "Name",
		instanceName: "Instance name",
		create: "Create",
		confirm: "Confirm",
		settings: "Editor Settings",
		interfaceLanguage: "Interface language",
		appearance: "Appearance",
		systemDefault: "System default",
		dark: "Dark",
		light: "Light",
		fontFamily: "Font family",
		fontSize: "Font size",
		autosave: "Autosave ms",
		wordWrap: "Word wrap",
		off: "Off",
		on: "On",
		editorTheme: "Editor theme",
		minimap: "Minimap",
		themePreview: "Theme Preview",
		reset: "Reset",
		apply: "Apply",
		betaTitle: "ATTENTION",
		betaEyebrow: "Cloud Beta Access",
		betaText: "Cloud is currently in beta and is available only to a limited number of computers involved in the project. If you have access, you may use it freely, test it, and use it in your own game projects.",
		betaNote: "Only the interface language changes. Your code is never translated.",
		continueForge: "Continue to Cloud",
		language: "Language",
	},
	"pt-BR": {
		brandSubtitle: "A complete integrated development environment for game scripting.",
		entryBrandSubtitle: "Workspace para scripts de jogo",
		entryLearn: "Aprender",
		entryPlugin: "Plugin",
		entryHeroBadge: "Workspace privado",
		entryHeroTitle: "Programe nas nuvens, sem poluição visual.",
		entryHeroBody: "Conecte sua sessão privada, abra a árvore do projeto e mantenha os scripts em um workspace limpo.",
		entryPreviewTitle: "Como o Cloud se sente",
		entryPreviewBody: "Um editor mais limpo, acesso rápido ao projeto e um caminho mais suave da ideia até o script.",
		entryPreviewKicker: "Fluxo focado",
		entryFeatureOneTitle: "Estrutura ao vivo",
		entryFeatureOneBody: "Abra a árvore do workspace, mantenha as pastas organizadas e troque entre scripts sem ruído.",
		entryFeatureTwoTitle: "Feito para sessões longas",
		entryFeatureTwoBody: "Hierarquia clara, espaçamento mais calmo e um layout que continua legível enquanto o projeto cresce.",
		entryConnectBadge: "Conectar",
		entryConnectTitle: "Entrar no Cloud",
		entryConnectBody: "Cole o ID da sessão e o Hidden Secret para abrir o workspace.",
		entryFlowOne: "Inicie uma sessão",
		entryFlowTwo: "Copie as credenciais",
		entryFlowThree: "Entre no Cloud",
		entrySessionLabel: "ID da sessão",
		entrySessionPlaceholder: "Cole o ID da sessão",
		entrySecretLabel: "Hidden Secret",
		entrySecretPlaceholder: "Cole o hidden secret",
		entryConnectAction: "Entrar no Cloud",
		entryShortcutSave: "Ctrl + S salva o script ativo",
		entryShortcutSelect: "Shift + Click deixa a multisseleção fácil",
		entryShortcutDelete: "Delete remove os itens selecionados",
		entryShortcutPaste: "Ctrl + C / X / V mantém os scripts em movimento",
		entryGuideTitle: "Útil logo de cara",
		entryGuideBody: "Tudo aqui aponta para uma parte real do fluxo, então a tela fica completa sem parecer barulhenta.",
		entryGuideOneTitle: "Abra scripts mais rápido",
		entryGuideOneBody: "Use o explorador, abas, busca no projeto e split view para continuar no mesmo fluxo.",
		entryGuideTwoTitle: "Mantenha a estrutura sob controle",
		entryGuideTwoBody: "Crie, renomeie, mova, duplique, recorte, copie, cole e exclua scripts ou pastas em um só lugar.",
		entryGuideThreeTitle: "Fique sincronizado",
		entryGuideThreeBody: "Salve alterações, mantenha o workspace atualizado e use o mesmo caminho de sessão durante todo o ciclo.",
		entryShortcutPanelTitle: "Controles do dia a dia",
		entryShortcutPanelBody: "As ações mais comuns ficam por perto para o app ser mais fácil de pegar o ritmo.",
		entryShortcutGridSave: "Salva o script que você está editando.",
		entryShortcutGridSelect: "Seleciona vários scripts de uma vez.",
		entryShortcutGridDelete: "Remove os scripts ou pastas selecionados.",
		entryShortcutGridPaste: "Copia, recorta e cola scripts no workspace.",
		entryCtaTitle: "Precisa do passo a passo?",
		entryCtaBody: "Use o Learn quando precisar rever os passos de configuração.",
		entryDownload: "Baixar app",
		entryLearnOpen: "Abrir Learn",
		entryPhraseOne: "Bem-vindo ao Cloud, pronto para programar?",
		entryPhraseTwo: "Abra a sessão e mantenha o fluxo limpo.",
		entryPhraseThree: "Selecione scripts, mova mais rápido e salve com frequência.",
		entryPhraseFour: "Menos ruído visual. Mais espaço para programar.",
		learnPageKicker: "Aprender",
		learnPageTitle: "Como o Cloud funciona",
		learnPageSubtitle: "Um guia curto para conectar o workspace e usar o editor sem atrito.",
		learnSidebarTitle: "O que o Cloud está fazendo",
		learnSidebarBody: "O Cloud mantém uma sessão privada entre o app e o seu ambiente de desenvolvimento, para os arquivos ficarem dentro de um único fluxo focado.",
		learnSidebarQuickTitle: "Conectar",
		learnSidebarQuickOne: "Abra o plugin dentro do seu ambiente de desenvolvimento de jogos.",
		learnSidebarQuickTwo: "Crie uma sessão privada.",
		learnSidebarQuickThree: "Copie o ID da sessão e o Hidden Secret.",
		learnSidebarKeysTitle: "Atalhos úteis",
		learnKeyOne: "Salva o script ativo.",
		learnKeyTwo: "Seleciona vários scripts no explorador.",
		learnKeyThree: "Remove scripts ou pastas selecionados.",
		learnKeyFour: "Copia, recorta e cola scripts ou pastas selecionados.",
		learnHeroTitle: "Um caminho simples da configuração até a edição de scripts.",
		learnHeroBody: "Se você está abrindo o Cloud pela primeira vez, siga estes passos uma vez. Depois disso, quase tudo vira abrir, editar, salvar e seguir em frente.",
		learnStepOneTitle: "Instale o Cloud",
		learnStepOneBody: "Use o app desktop para o fluxo mais limpo, ou a versão web quando precisar de acesso rápido.",
		learnStepTwoTitle: "Abra o plugin",
		learnStepTwoBody: "Abra o plugin no seu setup de desenvolvimento e gere uma nova sessão privada.",
		learnStepThreeTitle: "Copie as credenciais",
		learnStepThreeBody: "Pegue o ID da sessão e o Hidden Secret juntos. Você vai precisar dos dois antes do workspace carregar.",
		learnStepFourTitle: "Entre no Cloud",
		learnStepFourBody: "Cole os dois valores na tela inicial e entre no Cloud.",
		learnStepFiveTitle: "Trabalhe dentro do workspace",
		learnStepFiveBody: "Abra scripts, use abas, split do editor, busca no projeto e mantenha a estrutura organizada.",
		learnStepSixTitle: "Salve e gerencie arquivos",
		learnStepSixBody: "Use Ctrl + S para salvar e as ações de multisseleção, copiar, recortar, colar e excluir para gerenciar scripts mais rápido.",
		learnRoutineTitle: "Uma rotina normal do dia a dia",
		learnRoutineOne: "Conecte uma vez no começo da sessão.",
		learnRoutineTwo: "Abra os scripts em que você está trabalhando de verdade.",
		learnRoutineThree: "Salve com frequência e deixe o Cloud manter o workspace atualizado.",
		learnRoutineFour: "Abra Learn novamente quando quiser os passos de configuração por perto.",
		learnToolsTitle: "O que você pode gerenciar dentro do Cloud",
		learnToolsOne: "Criar novos scripts e pastas.",
		learnToolsTwo: "Renomear, duplicar, mover e excluir itens.",
		learnToolsThree: "Copiar, recortar e colar scripts pelo workspace.",
		learnToolsFour: "Alternar entre abas ou abrir split view quando precisar editar em paralelo.",
		learnPluginAction: "Abrir página do plugin",
		downloadApp: "Baixar Cloud App",
		robloxPlugin: "Plugin",
		explorer: "Explorador",
		privateSession: "Sessão privada",
		project: "Projeto",
		searchPlaceholder: "Buscar por nome, classe ou caminho",
		noFileOpen: "Nenhum arquivo aberto",
		filePathEmpty: "Conecte uma sessão privada do Cloud e abra um script.",
		search: "Buscar",
		closeSplit: "Fechar divisão",
		save: "Salvar",
		ready: "Pronto",
		footerHelp: "Ctrl+W fecha aba · Ctrl+1-9 troca abas · Ctrl+Shift+E compacta script · Ctrl+E expande script",
		connectionTitle: "Conexão",
		secureTitle: "Conecte ao seu workspace.",
		secureText: "O ID da sessão e o segredo são necessários antes do Cloud ler ou salvar arquivos.",
		connectedKicker: "Workspace conectado",
		connectedTitle: "Cloud está pronto",
		connectedHelp: "Use Esquecer apenas quando quiser desconectar este navegador da sessão atual.",
		done: "Pronto",
		sessionId: "ID da sessão",
		sessionSecret: "Segredo da sessão",
		pasteSessionId: "Cole o ID da sessão",
		pasteSessionSecret: "Cole o segredo da sessão",
		forget: "Esquecer",
		cancel: "Cancelar",
		connect: "Conectar",
		newInstance: "Nova instância",
		name: "Nome",
		instanceName: "Nome da instância",
		create: "Criar",
		confirm: "Confirmar",
		settings: "Configurações do editor",
		interfaceLanguage: "Idioma da interface",
		appearance: "Aparência",
		systemDefault: "Padrão do sistema",
		dark: "Escuro",
		light: "Claro",
		fontFamily: "Fonte",
		fontSize: "Tamanho da fonte",
		autosave: "Autosave em ms",
		wordWrap: "Quebra de linha",
		off: "Desligado",
		on: "Ligado",
		editorTheme: "Tema do editor",
		minimap: "Minimapa",
		themePreview: "Prévia do tema",
		reset: "Redefinir",
		apply: "Aplicar",
		betaTitle: "ATENÇÃO",
		betaEyebrow: "Acesso Beta do Cloud",
		betaText: "Esta aplicação está em BETA e está disponível apenas em um número limitado de computadores usados pela equipe de desenvolvimento do projeto. Se você tiver acesso, pode usar livremente, testar e usar em seus projetos de jogo.",
		betaNote: "Somente a interface muda de idioma. O seu código nunca é traduzido.",
		continueForge: "Continuar para o Cloud",
		language: "Idioma",
	},
	es: {
		brandSubtitle: "A complete integrated development environment for game scripting.",
		downloadApp: "Descargar Cloud App",
		robloxPlugin: "Plugin",
		explorer: "Explorador",
		privateSession: "Sesión privada",
		project: "Proyecto",
		searchPlaceholder: "Buscar por nombre, clase o ruta",
		noFileOpen: "Ningún archivo abierto",
		filePathEmpty: "Conecta una sesión privada de Cloud y abre un script.",
		search: "Buscar",
		closeSplit: "Cerrar división",
		save: "Guardar",
		ready: "Listo",
		footerHelp: "Ctrl+W cerrar pestaña · Ctrl+1-9 cambiar pestañas · Ctrl+Shift+E plegar script · Ctrl+E desplegar script",
		connectionTitle: "Conexión",
		secureTitle: "Conecta tu workspace.",
		secureText: "El ID y el secreto son necesarios antes de que Cloud pueda leer o guardar archivos.",
		connectedKicker: "Workspace conectado",
		connectedTitle: "Cloud está listo",
		connectedHelp: "Usa Olvidar solo cuando quieras desconectar este navegador de la sesión actual.",
		done: "Listo",
		sessionId: "ID de sesión",
		sessionSecret: "Secreto de sesión",
		pasteSessionId: "Pega el ID de sesión",
		pasteSessionSecret: "Pega el secreto de sesión",
		forget: "Olvidar",
		cancel: "Cancelar",
		connect: "Conectar",
		newInstance: "Nueva instancia",
		name: "Nombre",
		instanceName: "Nombre de instancia",
		create: "Crear",
		confirm: "Confirmar",
		settings: "Configuración del editor",
		interfaceLanguage: "Idioma de la interfaz",
		appearance: "Apariencia",
		systemDefault: "Predeterminado del sistema",
		dark: "Oscuro",
		light: "Claro",
		fontFamily: "Familia de fuente",
		fontSize: "Tamaño de fuente",
		autosave: "Autoguardado ms",
		wordWrap: "Ajuste de línea",
		off: "Apagado",
		on: "Encendido",
		editorTheme: "Tema del editor",
		minimap: "Minimapa",
		themePreview: "Vista previa del tema",
		reset: "Restablecer",
		apply: "Aplicar",
		betaTitle: "ATENCIÓN",
		betaEyebrow: "Acceso Beta de Cloud",
		betaText: "Esta aplicación está en BETA y solo está disponible en un número limitado de computadoras usadas por el equipo de desarrollo del proyecto. Si tienes acceso, puedes usarla libremente, probarla y usarla en tus proyectos de juego.",
		betaNote: "Solo cambia el idioma de la interfaz. Tu código nunca se traduce.",
		continueForge: "Continuar a Cloud",
		language: "Idioma",
	},
	fr: {
		brandSubtitle: "A complete integrated development environment for game scripting.",
		downloadApp: "Télécharger Cloud App",
		robloxPlugin: "Plugin",
		explorer: "Explorateur",
		privateSession: "Session privée",
		project: "Projet",
		searchPlaceholder: "Rechercher par nom, classe ou chemin",
		noFileOpen: "Aucun fichier ouvert",
		filePathEmpty: "Connectez une session Cloud privée et ouvrez un script.",
		search: "Rechercher",
		closeSplit: "Fermer la division",
		save: "Enregistrer",
		ready: "Prêt",
		footerHelp: "Ctrl+W fermer l’onglet · Ctrl+1-9 changer d’onglet · Ctrl+Shift+E plier le script · Ctrl+E déplier le script",
		connectionTitle: "Connexion",
		secureTitle: "Connectez votre workspace.",
		secureText: "L’ID de session et le secret sont nécessaires avant que Cloud puisse lire ou enregistrer des fichiers.",
		connectedKicker: "Workspace connecté",
		connectedTitle: "Cloud est prêt",
		connectedHelp: "Utilisez Oublier uniquement pour déconnecter ce navigateur de la session actuelle.",
		done: "Terminé",
		sessionId: "ID de session",
		sessionSecret: "Secret de session",
		pasteSessionId: "Collez l’ID de session",
		pasteSessionSecret: "Collez le secret de session",
		forget: "Oublier",
		cancel: "Annuler",
		connect: "Connecter",
		newInstance: "Nouvelle instance",
		name: "Nom",
		instanceName: "Nom de l’instance",
		create: "Créer",
		confirm: "Confirmer",
		settings: "Paramètres de l’éditeur",
		interfaceLanguage: "Langue de l’interface",
		appearance: "Apparence",
		systemDefault: "Système",
		dark: "Sombre",
		light: "Clair",
		fontFamily: "Police",
		fontSize: "Taille de police",
		autosave: "Sauvegarde auto ms",
		wordWrap: "Retour à la ligne",
		off: "Désactivé",
		on: "Activé",
		editorTheme: "Thème de l’éditeur",
		minimap: "Minicarte",
		themePreview: "Aperçu du thème",
		reset: "Réinitialiser",
		apply: "Appliquer",
		betaTitle: "ATTENTION",
		betaEyebrow: "Accès bêta Cloud",
		betaText: "Cette application est actuellement en BETA et n’est disponible que sur un nombre limité d’ordinateurs utilisés par l’équipe de développement du projet. Si vous y avez accès, vous pouvez l’utiliser librement, la tester et l’utiliser dans vos projets de jeu.",
		betaNote: "Seule la langue de l’interface change. Votre code n’est jamais traduit.",
		continueForge: "Continuer vers Cloud",
		language: "Langue",
	},
	de: {
		brandSubtitle: "A complete integrated development environment for game scripting.",
		downloadApp: "Cloud App herunterladen",
		robloxPlugin: "Plugin",
		explorer: "Explorer",
		privateSession: "Private Sitzung",
		project: "Projekt",
		searchPlaceholder: "Nach Name, Klasse oder Pfad suchen",
		noFileOpen: "Keine Datei geöffnet",
		filePathEmpty: "Verbinde eine private Cloud-Sitzung und öffne ein Script.",
		search: "Suchen",
		closeSplit: "Split schließen",
		save: "Speichern",
		ready: "Bereit",
		footerHelp: "Ctrl+W Tab schließen · Ctrl+1-9 Tabs wechseln · Ctrl+Shift+E Script einklappen · Ctrl+E ausklappen",
		connectionTitle: "Verbindung",
		secureTitle: "Verbinde deinen Workspace.",
		secureText: "Sitzungs-ID und Secret werden benötigt, bevor Cloud Dateien lesen oder speichern kann.",
		connectedKicker: "Workspace verbunden",
		connectedTitle: "Cloud ist bereit",
		connectedHelp: "Nutze Vergessen nur, wenn du diesen Browser von der aktuellen Sitzung trennen möchtest.",
		done: "Fertig",
		sessionId: "Sitzungs-ID",
		sessionSecret: "Sitzungs-Secret",
		pasteSessionId: "Sitzungs-ID einfügen",
		pasteSessionSecret: "Sitzungs-Secret einfügen",
		forget: "Vergessen",
		cancel: "Abbrechen",
		connect: "Verbinden",
		newInstance: "Neue Instanz",
		name: "Name",
		instanceName: "Instanzname",
		create: "Erstellen",
		confirm: "Bestätigen",
		settings: "Editor-Einstellungen",
		interfaceLanguage: "Sprache der Oberfläche",
		appearance: "Darstellung",
		systemDefault: "Systemstandard",
		dark: "Dunkel",
		light: "Hell",
		fontFamily: "Schriftfamilie",
		fontSize: "Schriftgröße",
		autosave: "Autosave ms",
		wordWrap: "Zeilenumbruch",
		off: "Aus",
		on: "Ein",
		editorTheme: "Editor-Theme",
		minimap: "Minimap",
		themePreview: "Theme-Vorschau",
		reset: "Zurücksetzen",
		apply: "Anwenden",
		betaTitle: "ACHTUNG",
		betaEyebrow: "Cloud Beta-Zugang",
		betaText: "Diese Anwendung befindet sich derzeit in der BETA und ist nur auf einer begrenzten Anzahl von Computern verfügbar, die vom Entwicklungsteam des Projekts genutzt werden. Wenn du Zugang hast, kannst du sie frei testen und in deinen Spielprojekten verwenden.",
		betaNote: "Nur die Oberfläche wird übersetzt. Dein Code wird niemals übersetzt.",
		continueForge: "Weiter zu Cloud",
		language: "Sprache",
	},
	it: {
		downloadApp: "Scarica Cloud App",
		explorer: "Esplora",
		project: "Progetto",
		search: "Cerca",
		save: "Salva",
		ready: "Pronto",
		connect: "Connetti",
		cancel: "Annulla",
		create: "Crea",
		settings: "Impostazioni editor",
		language: "Lingua",
	},
	ja: {
		downloadApp: "Cloud App をダウンロード",
		explorer: "エクスプローラー",
		project: "プロジェクト",
		search: "検索",
		save: "保存",
		ready: "準備完了",
		connect: "接続",
		cancel: "キャンセル",
		create: "作成",
		settings: "エディター設定",
		language: "言語",
	},
	ko: {
		downloadApp: "Cloud App 다운로드",
		explorer: "탐색기",
		project: "프로젝트",
		search: "검색",
		save: "저장",
		ready: "준비됨",
		connect: "연결",
		cancel: "취소",
		create: "생성",
		settings: "편집기 설정",
		language: "언어",
	},
	"zh-CN": {
		downloadApp: "下载 Cloud App",
		explorer: "资源管理器",
		project: "项目",
		search: "搜索",
		save: "保存",
		ready: "就绪",
		connect: "连接",
		cancel: "取消",
		create: "创建",
		settings: "编辑器设置",
		language: "语言",
	},
	ru: {
		downloadApp: "Скачать Cloud App",
		explorer: "Проводник",
		project: "Проект",
		search: "Поиск",
		save: "Сохранить",
		ready: "Готово",
		connect: "Подключить",
		cancel: "Отмена",
		create: "Создать",
		settings: "Настройки редактора",
		language: "Язык",
	},
};

function normalizeLanguage(language) {
	const value = String(language || "").trim();
	return LANGUAGES.some(item => item.code === value) ? value : "en";
}

export function getLanguage() {
	return normalizeLanguage(loadJson(STORAGE.language, "en"));
}

export function setLanguage(language) {
	const normalized = normalizeLanguage(language);
	saveJson(STORAGE.language, normalized);
	return normalized;
}

export function t(language, key) {
	const normalized = normalizeLanguage(language);
	return (TRANSLATIONS[normalized] && TRANSLATIONS[normalized][key]) || TRANSLATIONS.en[key] || key;
}

function setText(selector, value) {
	const element = document.querySelector(selector);
	if (element) element.textContent = value;
}

function setPlaceholder(selector, value) {
	const element = document.querySelector(selector);
	if (element) element.placeholder = value;
}

function applyDataTranslations(lang) {
	document.querySelectorAll("[data-i18n]").forEach(element => {
		const key = element.dataset.i18n;
		if (!key) return;
		element.textContent = t(lang, key);
	});

	document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
		const key = element.dataset.i18nPlaceholder;
		if (!key) return;
		element.placeholder = t(lang, key);
	});
}

export function populateLanguageSelect(select, activeLanguage = getLanguage()) {
	if (!select) return;
	select.innerHTML = "";
	for (const item of LANGUAGES) {
		const option = document.createElement("option");
		option.value = item.code;
		option.textContent = item.label;
		select.appendChild(option);
	}
	select.value = normalizeLanguage(activeLanguage);
}

export function applyLanguage(language) {
	const lang = setLanguage(language);
	document.documentElement.lang = lang;

	applyDataTranslations(lang);

	setText(".brand-copy span", t(lang, "brandSubtitle"));
	setText("#downloadAppButton", t(lang, "downloadApp"));
	setText("#robloxPluginButton", t(lang, "robloxPlugin"));
	setText(".sidebar-title > span", t(lang, "explorer"));
	setText(".connection-card-title", t(lang, "privateSession"));
	setText(".project-header > span:first-child", t(lang, "project"));
	setPlaceholder("#searchInput", t(lang, "searchPlaceholder"));
	setText("#projectSearchButton", t(lang, "search"));
	setText("#closeSplitButton", t(lang, "closeSplit"));
	setText("#saveButton", t(lang, "save"));
	setText("#footerLeft", t(lang, "ready"));
	setText("#footerRight", t(lang, "footerHelp"));
	setText("#connectionModal .modal-title", t(lang, "connectionTitle"));
	setText("#connectionModal .secure-note strong", t(lang, "secureTitle"));
	setText("#connectionModal .secure-note span", t(lang, "secureText"));
	setText("#connectedSessionPanel .connection-kicker", t(lang, "connectedKicker"));
	setText("#connectedSessionPanel .connected-session-card strong", t(lang, "connectedTitle"));
	setText("#connectedSessionPanel .connection-helper", t(lang, "connectedHelp"));
	setText('label[for="sessionInput"]', t(lang, "sessionId"));
	setText('label[for="secretInput"]', t(lang, "sessionSecret"));
	setPlaceholder("#sessionInput", t(lang, "pasteSessionId"));
	setPlaceholder("#secretInput", t(lang, "pasteSessionSecret"));
	setText("#disconnectButton", t(lang, "forget"));
	setText("#cancelConnectionButton", document.querySelector("#connectionDialog.connected") ? t(lang, "done") : t(lang, "cancel"));
	setText("#loadButton", t(lang, "connect"));
	setText("#createModal .modal-title", t(lang, "newInstance"));
	setText('label[for="createNameInput"]', t(lang, "name"));
	setPlaceholder("#createNameInput", t(lang, "instanceName"));
	setText("#cancelCreateButton", t(lang, "cancel"));
	setText("#confirmCreateButton", t(lang, "create"));
	setText("#confirmTitle", t(lang, "confirm"));
	setText("#cancelConfirmButton", t(lang, "cancel"));
	setText("#acceptConfirmButton", t(lang, "confirm"));
	setText("#settingsModal .modal-title", t(lang, "settings"));
	setText('label[for="languageInput"]', t(lang, "interfaceLanguage"));
	setText('label[for="appearanceInput"]', t(lang, "appearance"));
	setText('#appearanceInput option[value="system"]', t(lang, "systemDefault"));
	setText('#appearanceInput option[value="dark"]', t(lang, "dark"));
	setText('#appearanceInput option[value="light"]', t(lang, "light"));
	setText('label[for="fontFamilyInput"]', t(lang, "fontFamily"));
	setText('label[for="fontSizeInput"]', t(lang, "fontSize"));
	setText('label[for="autosaveInput"]', t(lang, "autosave"));
	setText('label[for="wordWrapInput"]', t(lang, "wordWrap"));
	setText('#wordWrapInput option[value="off"]', t(lang, "off"));
	setText('#wordWrapInput option[value="on"]', t(lang, "on"));
	setText('label[for="editorThemeInput"]', t(lang, "editorTheme"));
	setText('label[for="minimapInput"]', t(lang, "minimap"));
	setText(".preview-head span:first-child", t(lang, "themePreview"));
	setText("#resetSettingsButton", t(lang, "reset"));
	setText("#saveSettingsButton", t(lang, "apply"));
	setText("#betaEyebrow", t(lang, "betaEyebrow"));
	setText("#betaTitle", t(lang, "betaTitle"));
	setText("#betaWarningText", t(lang, "betaText"));
	setText("#betaWarningNote", t(lang, "betaNote"));
	setText('label[for="betaLanguageSelect"]', t(lang, "language"));
	setText("#betaContinueButton", t(lang, "continueForge"));

	const fileTitle = document.querySelector("#fileTitle");
	if (fileTitle && fileTitle.textContent === TRANSLATIONS.en.noFileOpen) fileTitle.textContent = t(lang, "noFileOpen");
	const filePath = document.querySelector("#filePath");
	if (filePath && filePath.textContent === TRANSLATIONS.en.filePathEmpty) filePath.textContent = t(lang, "filePathEmpty");

	return lang;
}
