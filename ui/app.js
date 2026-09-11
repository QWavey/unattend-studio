"use strict";

const $ = (id) => document.getElementById(id);
const escapeXml = (value) => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"})[char]);
const de = {
  "Local workspace":"Lokaler Arbeitsbereich","Source":"Quelle","Night":"Nacht","Day":"Tag","New answer file":"Neue Antwortdatei",
  "Setup style":"Setup-Auswahl","Basics":"Grundlagen","Accounts":"Konten","Remove apps":"Apps entfernen","Advanced":"Erweitert","Output":"Ausgabe",
  "Your settings and downloaded file remain on this computer.":"Deine Einstellungen und heruntergeladenen Dateien bleiben auf diesem Computer.",
  "Build a clean Windows installation.":"Erstelle eine saubere Windows-Installation.","Step 1 of 6":"Schritt 1 von 6","Choose a starting point":"Wähle dein Setup",
  "This sets sensible defaults. Every choice can still be changed.":"Wähle eine passende Grundlage. Alle Einstellungen lassen sich später ändern.",
  "Lean Windows":"Schlankes Windows","Removes nearly everything Windows does not need to run. Best for experienced users who want the smallest install.":"Entfernt nahezu alles, was Windows nicht zum Ausführen benötigt. Für erfahrene Nutzer, die eine möglichst kleine Installation möchten.",
  "Clean Windows":"Sauberes Windows","Removes advertising apps and common bloat while keeping core Windows tools and gaming support.":"Entfernt Werbe-Apps und übliche Bloatware, behält aber wichtige Windows-Werkzeuge und Gaming-Unterstützung.",
  "Custom setup":"Eigenes Setup","Starts with no removals. Pick every app and setting yourself.":"Startet ohne Entfernungsvorgaben. Wähle jede App und Einstellung selbst.",
  "Preconfigured":"Vorkonfiguriert","Manual":"Manuell","Presets":"Vorlagen","Saved locally":"Lokal gespeichert","Setup library":"Setup-Bibliothek","Back to setup styles":"Zurück zu den Setup-Stilen","Continue":"Weiter",
  "Step 2 of 6":"Schritt 2 von 6","Windows basics":"Windows einrichten","Choose the language and identify this computer.":"Lege Sprache, Tastatur und Computernamen fest.",
  "Display language":"Anzeigesprache","Keyboard layout":"Tastaturlayout","Computer name":"Computername","Processor architecture":"Prozessorarchitektur",
  "English (United States)":"Englisch (USA)","English (United Kingdom)":"Englisch (Großbritannien)","United Kingdom":"Großbritannien","German":"Deutsch","French":"Französisch","Greek":"Griechisch","64-bit PC (recommended)":"64-Bit-PC (empfohlen)","32-bit PC":"32-Bit-PC",
  "Maximum 15 characters. Letters, numbers and hyphens work best.":"Maximal 15 Zeichen. Buchstaben, Zahlen und Bindestriche funktionieren am besten.","Back":"Zurück","Next: accounts":"Weiter: Konten",
  "Step 3 of 6":"Schritt 3 von 6","Local accounts":"Lokale Konten","Add up to five accounts. At least one administrator is recommended.":"Füge bis zu fünf Konten hinzu. Mindestens ein Administratorkonto wird empfohlen.",
  "Add another account":"Weiteres Konto hinzufügen","Accept the license agreement":"Lizenzbedingungen akzeptieren","Required for an unattended Windows Setup.":"Für ein unbeaufsichtigtes Windows-Setup erforderlich.",
  "Go straight to the desktop":"Direkt zum Desktop","Skips the network and remaining Windows setup screens, then signs in once.":"Überspringt Netzwerk- und restliche Windows-Einrichtungsseiten und meldet sich einmal an.","Next: remove apps":"Weiter: Apps entfernen",
  "Step 4 of 6":"Schritt 4 von 6","Remove preinstalled apps":"Vorinstallierte Apps entfernen","Removal runs locally after the first administrator signs in.":"Die Entfernung läuft lokal nach der ersten Administratoranmeldung.",
  "Xbox only":"Nur Xbox","Clear":"Zurücksetzen","Search apps":"Apps suchen","Some Windows tools are harder to restore after removal.":"Einige Windows-Werkzeuge lassen sich nach dem Entfernen nur schwer wiederherstellen.","Next: advanced":"Weiter: Erweitert",
  "Step 5 of 6":"Schritt 5 von 6","Advanced options":"Erweiterte Optionen","Extra Windows Setup controls. Defaults are conservative.":"Passe zusätzliche Setup-Optionen an. Die Voreinstellungen sind sicher gewählt.",
  "Recommended":"Empfohlen","Privacy":"Datenschutz","Developer":"Entwicklung","Virtual machine":"Virtuelle Maschine","Advanced settings can change security and recovery behavior.":"Erweiterte Einstellungen können Sicherheit und Wiederherstellung beeinflussen.","Review each enabled option before using the answer file.":"Prüfe jede aktivierte Option, bevor du die Antwortdatei verwendest.","Next: output":"Weiter: Ausgabe",
  "Step 6 of 6":"Schritt 6 von 6","Your file is ready":"Deine Datei ist bereit","Review the setup, save it for later, or download the Windows answer file.":"Prüfe das Setup, speichere es als Vorlage oder lade die Windows-Antwortdatei herunter.",
  "Inspect generated XML":"Erzeugtes XML prüfen","Before installing:":"Vor der Installation:","keep a backup and disconnect drives you do not want Windows Setup to touch.":"Erstelle eine Sicherung und trenne Laufwerke, die Windows Setup nicht verändern soll.",
  "Save as preset":"Als Vorlage speichern","Copy XML":"XML kopieren","Download file":"Datei herunterladen",
  "Windows Setup":"Windows-Setup","Disk and recovery":"Datenträger und Wiederherstellung","Privacy and security":"Datenschutz und Sicherheit","Desktop and taskbar":"Desktop und Taskleiste","System":"System","Virtual machine tools":"Werkzeuge für virtuelle Maschinen",
  "Run Windows PE interactively":"Windows PE interaktiv ausführen","Enter product key interactively":"Produktschlüssel interaktiv eingeben","Use firmware product key":"Produktschlüssel aus Firmware verwenden","Select Windows image interactively":"Windows-Abbild interaktiv auswählen","Bypass Windows 11 requirements":"Windows-11-Anforderungen umgehen","Allow setup without internet":"Setup ohne Internet erlauben","Skip network page automatically":"Netzwerkseite automatisch überspringen","Sign in automatically once":"Einmal automatisch anmelden","Hide PowerShell windows":"PowerShell-Fenster ausblenden",
  "Wipe and partition target disk":"Ziellaufwerk löschen und partitionieren","Automatic GPT or MBR layout":"Automatisches GPT- oder MBR-Layout","Install Windows Recovery Environment":"Windows-Wiederherstellungsumgebung installieren","Remove Windows Recovery Environment":"Windows-Wiederherstellungsumgebung entfernen","Custom paging file":"Benutzerdefinierte Auslagerungsdatei","No paging file":"Keine Auslagerungsdatei",
  "Prevent automatic device encryption":"Automatische Geräteverschlüsselung verhindern","Disable Windows Defender":"Windows Defender deaktivieren","Disable SmartScreen":"SmartScreen deaktivieren","Disable telemetry":"Telemetrie deaktivieren","Disable activity history":"Aktivitätsverlauf deaktivieren","Disable advertising ID":"Werbe-ID deaktivieren","Disable app launch tracking":"App-Startverfolgung deaktivieren","Disable location services":"Ortungsdienste deaktivieren",
  "Always show file extensions":"Dateierweiterungen immer anzeigen","Show hidden files":"Versteckte Dateien anzeigen","Use classic context menu":"Klassisches Kontextmenü verwenden","Open File Explorer to This PC":"Datei-Explorer mit „Dieser PC“ öffnen","Hide taskbar search":"Taskleistensuche ausblenden","Hide widgets":"Widgets ausblenden","Remove Start menu pins":"Startmenü-Anheftungen entfernen","Disable Windows Spotlight":"Windows-Blickpunkt deaktivieren",
  "Disable hibernation":"Ruhezustand deaktivieren","Disable first-logon animation":"Animation bei erster Anmeldung deaktivieren","Disable automatic driver delivery":"Automatische Treiberbereitstellung deaktivieren","Prevent update restarts while signed in":"Update-Neustarts während der Anmeldung verhindern","Disable Delivery Optimization":"Übermittlungsoptimierung deaktivieren","Enable Windows Sandbox":"Windows Sandbox aktivieren","Enable Windows Subsystem for Linux":"Windows-Subsystem für Linux aktivieren",
  "Install VirtualBox Guest Additions":"VirtualBox-Gasterweiterungen installieren","Install VMware Tools":"VMware Tools installieren","Install VirtIO tools":"VirtIO-Werkzeuge installieren","Install Parallels Tools":"Parallels Tools installieren",
  "Opens a command prompt before Setup continues.":"Öffnet eine Eingabeaufforderung, bevor das Setup fortfährt.","Windows Setup asks for a product key.":"Windows Setup fragt nach einem Produktschlüssel.","Lets Setup use the key stored in UEFI firmware.":"Erlaubt dem Setup, den in der UEFI-Firmware gespeicherten Schlüssel zu verwenden.","Shows the edition picker instead of choosing an image silently.":"Zeigt die Editionsauswahl, statt ein Abbild automatisch auszuwählen.","Skips TPM, Secure Boot, RAM and CPU checks.":"Überspringt Prüfungen für TPM, Secure Boot, RAM und CPU.","Makes the local-account path available during OOBE.":"Macht die Einrichtung mit lokalem Konto während OOBE verfügbar.","Skips the connection page and continues with the local account.":"Überspringt die Verbindungsseite und fährt mit dem lokalen Konto fort.","Uses the first local account for the initial sign-in, then disables automatic sign-in.":"Verwendet das erste lokale Konto für die erste Anmeldung und deaktiviert danach die automatische Anmeldung.","Runs customization scripts without visible console windows.":"Führt Anpassungsskripte ohne sichtbare Konsolenfenster aus.",
  "Erases disk 0 and installs to its available partition.":"Löscht Datenträger 0 und installiert auf der verfügbaren Partition.","Uses GPT for UEFI and MBR for legacy BIOS. Requires disk wiping.":"Verwendet GPT für UEFI und MBR für Legacy-BIOS. Erfordert das Löschen des Datenträgers.","Enables WinRE after Windows is installed.":"Aktiviert WinRE nach der Windows-Installation.","Disables WinRE and removes its recovery image.":"Deaktiviert WinRE und entfernt das Wiederherstellungsabbild.","Sets a fixed initial and maximum paging-file size.":"Legt feste Anfangs- und Maximalgrößen für die Auslagerungsdatei fest.","Disables automatic paging-file management.":"Deaktiviert die automatische Verwaltung der Auslagerungsdatei.",
  "Disables Microsoft Defender services and policy protection.":"Deaktiviert Microsoft-Defender-Dienste und Richtlinienschutz.","Enables the disposable Windows Sandbox feature. Pro or Enterprise is required.":"Aktiviert die temporäre Windows Sandbox. Pro oder Enterprise ist erforderlich.","Enables the WSL optional feature. A Linux distribution is not installed.":"Aktiviert das optionale WSL-Feature. Eine Linux-Distribution wird nicht installiert.","Installs from an attached Guest Additions ISO on first sign-in.":"Installiert bei der ersten Anmeldung von einer eingebundenen Guest-Additions-ISO.","Installs from an attached VMware Tools ISO on first sign-in.":"Installiert bei der ersten Anmeldung von einer eingebundenen VMware-Tools-ISO.","Installs from an attached virtio-win ISO on first sign-in.":"Installiert bei der ersten Anmeldung von einer eingebundenen virtio-win-ISO.","Installs from an attached Parallels Tools ISO on first sign-in.":"Installiert bei der ersten Anmeldung von einer eingebundenen Parallels-Tools-ISO.",
  "Initial size":"Anfangsgröße","Maximum size":"Maximalgröße","Account name":"Kontoname","Password":"Passwort","Required":"Erforderlich","Stored as plain text inside the XML file.":"Wird als Klartext in der XML-Datei gespeichert.","Is administrator":"Ist Administrator","Can install software and change system settings.":"Kann Software installieren und Systemeinstellungen ändern.","Remove":"Entfernen","Delete":"Löschen","Use preset":"Vorlage verwenden",
  "Open your saved Windows setup.":"Öffne dein gespeichertes Windows-Setup.","No saved setup yet. Open to learn how to create one.":"Noch kein Setup gespeichert. Öffne den Bereich, um mehr zu erfahren.","No presets saved yet":"Noch keine Vorlagen gespeichert","Complete a setup and choose “Save as preset” on the Output page. It will appear here on this computer.":"Schließe ein Setup ab und wähle auf der Ausgabeseite „Als Vorlage speichern“. Danach erscheint es hier auf diesem Computer.",
  "Search apps, for example Xbox or Copilot":"Apps suchen, zum Beispiel Xbox oder Copilot","Loading app catalog":"App-Katalog wird geladen","No apps match that search.":"Keine Apps entsprechen dieser Suche.","special removal rule":"besondere Entfernungsregel","Windows component, harder to restore":"Windows-Komponente, schwerer wiederherzustellen","Saved Windows setup":"Gespeichertes Windows-Setup","Saved preset":"Gespeicherte Vorlage","Setup name":"Setup-Name","Rename setup":"Setup umbenennen",
  "Show password":"Passwort anzeigen","Hide password":"Passwort ausblenden","Switch to light mode":"Zum hellen Modus wechseln","Switch to dark mode":"Zum dunklen Modus wechseln","Switch page to German":"Seite auf Deutsch umstellen","Switch page to English":"Seite auf Englisch umstellen","Copied":"Kopiert","Preset saved":"Vorlage gespeichert"
};
const t = (english) => document.documentElement.lang === "de" ? (de[english] || english) : english;
const state = {
  page: 0,
  completed: new Set(),
  profile: "standard",
  setupName: "",
  uiLanguage: document.documentElement.lang === "de" ? "de" : "en",
  preconfigured: false,
  catalog: [],
  selectedApps: new Set(),
  accounts: [{ id: crypto.randomUUID(), name: "", password: "", isAdmin: true, passwordVisible: false }]
};

const coreApps = new Set(["Microsoft Store","Calculator","Photos","Paint","Notepad (modern)","Windows Terminal","Snipping Tool"]);
const recommendedApps = new Set(["Clipchamp","Copilot","Cortana","Dev Home","Feedback Hub","Get Help","Maps","News","Office 365","Power Automate","Solitaire Collection","Tips","Weather","Your Phone / Phone Link"]);
const advancedGroups = {
  "Windows Setup":["Run Windows PE interactively","Enter product key interactively","Use firmware product key","Select Windows image interactively","Bypass Windows 11 requirements","Allow setup without internet","Skip network page automatically","Sign in automatically once","Hide PowerShell windows"],
  "Disk and recovery":["Wipe and partition target disk","Automatic GPT or MBR layout","Install Windows Recovery Environment","Remove Windows Recovery Environment","Custom paging file","No paging file"],
  "Privacy and security":["Prevent automatic device encryption","Disable Windows Defender","Disable SmartScreen","Disable telemetry","Disable activity history","Disable advertising ID","Disable app launch tracking","Disable location services"],
  "Desktop and taskbar":["Always show file extensions","Show hidden files","Use classic context menu","Open File Explorer to This PC","Hide taskbar search","Hide widgets","Remove Start menu pins","Disable Windows Spotlight"],
  "System":["Disable hibernation","Disable first-logon animation","Disable automatic driver delivery","Prevent update restarts while signed in","Disable Delivery Optimization","Enable Windows Sandbox","Enable Windows Subsystem for Linux"],
  "Virtual machine tools":["Install VirtualBox Guest Additions","Install VMware Tools","Install VirtIO tools","Install Parallels Tools"]
};
const advancedHelp = {
  "Run Windows PE interactively":"Opens a command prompt before Setup continues.",
  "Enter product key interactively":"Windows Setup asks for a product key.",
  "Use firmware product key":"Lets Setup use the key stored in UEFI firmware.",
  "Select Windows image interactively":"Shows the edition picker instead of choosing an image silently.",
  "Bypass Windows 11 requirements":"Skips TPM, Secure Boot, RAM and CPU checks.",
  "Allow setup without internet":"Makes the local-account path available during OOBE.",
  "Skip network page automatically":"Skips the connection page and continues with the local account.",
  "Sign in automatically once":"Uses the first local account for the initial sign-in, then disables automatic sign-in.",
  "Hide PowerShell windows":"Runs customization scripts without visible console windows.",
  "Wipe and partition target disk":"Erases disk 0 and installs to its available partition.",
  "Automatic GPT or MBR layout":"Uses GPT for UEFI and MBR for legacy BIOS. Requires disk wiping.",
  "Install Windows Recovery Environment":"Enables WinRE after Windows is installed.",
  "Remove Windows Recovery Environment":"Disables WinRE and removes its recovery image.",
  "Custom paging file":"Sets a fixed initial and maximum paging-file size.",
  "No paging file":"Disables automatic paging-file management.",
  "Disable Windows Defender":"Disables Microsoft Defender services and policy protection.",
  "Enable Windows Sandbox":"Enables the disposable Windows Sandbox feature. Pro or Enterprise is required.",
  "Enable Windows Subsystem for Linux":"Enables the WSL optional feature. A Linux distribution is not installed.",
  "Install VirtualBox Guest Additions":"Installs from an attached Guest Additions ISO on first sign-in.",
  "Install VMware Tools":"Installs from an attached VMware Tools ISO on first sign-in.",
  "Install VirtIO tools":"Installs from an attached virtio-win ISO on first sign-in.",
  "Install Parallels Tools":"Installs from an attached Parallels Tools ISO on first sign-in."
};
const exclusiveAdvanced = {
  "Enter product key interactively":["Use firmware product key"], "Use firmware product key":["Enter product key interactively"],
  "Install Windows Recovery Environment":["Remove Windows Recovery Environment"], "Remove Windows Recovery Environment":["Install Windows Recovery Environment"],
  "Custom paging file":["No paging file"], "No paging file":["Custom paging file"]
};
const advancedPresets = {
  recommended:["Allow setup without internet","Skip network page automatically","Disable telemetry","Disable activity history","Disable advertising ID","Disable app launch tracking","Always show file extensions","Use classic context menu","Hide widgets","Disable Windows Spotlight","Prevent update restarts while signed in","Disable Delivery Optimization"],
  privacy:["Disable telemetry","Disable activity history","Disable advertising ID","Disable app launch tracking","Disable location services","Disable Windows Spotlight","Disable Delivery Optimization"],
  developer:["Always show file extensions","Show hidden files","Use classic context menu","Open File Explorer to This PC","Prevent update restarts while signed in","Enable Windows Sandbox","Enable Windows Subsystem for Linux"],
  "virtual-machine":["Bypass Windows 11 requirements","Allow setup without internet","Skip network page automatically","Sign in automatically once","Hide PowerShell windows","Disable hibernation","Disable first-logon animation"],
  none:[]
};

function translateStaticDom() {
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  while(walker.nextNode()){
    const node=walker.currentNode, trimmed=node.nodeValue.trim();
    if(!trimmed) continue;
    const english=node._i18nEnglish||trimmed;
    if(!(english in de)) continue;
    node._i18nEnglish=english;
    node.nodeValue=node.nodeValue.replace(trimmed,t(english));
  }
  document.querySelectorAll("[placeholder],[aria-label]").forEach((element)=>{
    for(const attribute of ["placeholder","aria-label"]){
      if(!element.hasAttribute(attribute)) continue;
      const cache=`i18n${attribute.replace("-","")}`;
      const english=element.dataset[cache]||element.getAttribute(attribute);
      if(!(english in de)) continue;
      element.dataset[cache]=english; element.setAttribute(attribute,t(english));
    }
  });
}

function updateLanguageToggle(){const german=state.uiLanguage==="de";$("language-toggle").querySelector(".language-flag").innerHTML=german?'<svg viewBox="0 0 60 36"><rect width="60" height="12" fill="#181818"/><rect y="12" width="60" height="12" fill="#d71920"/><rect y="24" width="60" height="12" fill="#ffce00"/></svg>':'<svg viewBox="0 0 60 36"><rect width="60" height="36" fill="#012169"/><path d="M0 0l60 36M60 0 0 36" stroke="#fff" stroke-width="8"/><path d="M0 0l60 36M60 0 0 36" stroke="#c8102e" stroke-width="4"/><path d="M30 0v36M0 18h60" stroke="#fff" stroke-width="12"/><path d="M30 0v36M0 18h60" stroke="#c8102e" stroke-width="7"/></svg>';$("language-toggle").querySelector(".language-code").textContent=german?"DE":"EN";$("language-toggle").setAttribute("aria-label",german?t("Switch page to English"):"Switch page to German");}
function applyUiLanguage(language,persist=true){
  const selected=selectedAdvanced(), paging={initial:$("pagefile-initial")?.value,maximum:$("pagefile-maximum")?.value};
  state.uiLanguage=language==="de"?"de":"en"; document.documentElement.lang=state.uiLanguage;
  if(persist){try{localStorage.setItem("unattend-studio-language",state.uiLanguage);}catch{}}
  renderAccounts(); renderAdvancedOptions();
  document.querySelectorAll("[data-advanced]").forEach((input)=>{input.checked=selected.has(input.dataset.advanced);input.closest(".option-wrap")?.classList.toggle("enabled",input.checked);});
  if(paging.initial)$("pagefile-initial").value=paging.initial;if(paging.maximum)$("pagefile-maximum").value=paging.maximum;
  if(state.catalog.length)renderAppList(); updatePresetChoice(); if(!$("preset-panel").hidden)renderPresetPanel(); if(state.page===5)renderReview();
  translateStaticDom(); updateLanguageToggle(); updateThemeToggle();
}

function reducedMotion() { return matchMedia("(prefers-reduced-motion: reduce)").matches; }
function updateStepNavigation() {
  document.querySelectorAll("#steps li").forEach((step, i) => {
    const isCurrent = i === state.page;
    const isComplete = state.completed.has(i);
    step.classList.toggle("current", isCurrent);
    step.classList.toggle("complete", isComplete && i < state.page);
    step.classList.toggle("returnable", isComplete && i > state.page);
    const button = step.querySelector("button");
    button.disabled = !isCurrent && !isComplete;
    button.setAttribute("aria-disabled", String(button.disabled));
    if (isCurrent) button.setAttribute("aria-current", "step"); else button.removeAttribute("aria-current");
  });
}
function showPage(index) {
  const next = Math.max(0, Math.min(5, index));
  const oldPage = document.querySelector(".wizard-page.active");
  const newPage = document.querySelector(`[data-page="${next}"]`);
  state.page = next;
  if (next === 5) state.completed.add(5);
  document.querySelectorAll(".wizard-page").forEach((page) => page.classList.toggle("active", page === newPage));
  updateStepNavigation();
  if (!reducedMotion() && oldPage !== newPage) newPage.animate([{opacity:0,transform:"translateX(8px)"},{opacity:1,transform:"translateX(0)"}],{duration:220,easing:"cubic-bezier(.2,.8,.2,1)"});
  if (next === 5) renderReview();
  document.querySelector(".work-area").scrollIntoView({behavior:reducedMotion()?"auto":"smooth",block:"start"});
}

function appKey(app) { return app.DisplayName; }
function appSelectors(app, typeName) { return (app.Steps || []).filter((step) => String(step.$type || "").includes(typeName) && step.Selector).map((step) => step.Selector); }

function applyPreset(preset) {
  state.selectedApps.clear();
  if (preset === "recommended") state.catalog.forEach((app) => { if (recommendedApps.has(appKey(app))) state.selectedApps.add(appKey(app)); });
  if (preset === "xbox") state.catalog.forEach((app) => { if (app.DisplayName === "Xbox Apps") state.selectedApps.add(appKey(app)); });
  if (preset === "minimal") state.catalog.forEach((app) => state.selectedApps.add(appKey(app)));
  renderAppList();
  updateOutput();
}

function selectProfile(profile) {
  state.profile = profile;
  state.setupName = "";
  document.querySelectorAll(".profile-option").forEach((card) => card.classList.toggle("selected", card.dataset.profileCard === profile));
  if (profile === "preset") return;
  if (state.catalog.length) applyPreset(profile === "standard" ? "recommended" : profile === "minimal" ? "minimal" : "none");
}

function savedPreset() {
  try {
    const value=localStorage.getItem("unattend-studio-preset-v1"), preset=value?JSON.parse(value):null;
    if(!preset||typeof preset!=="object"||Array.isArray(preset)||preset.version!==1) return null;
    if(!Array.isArray(preset.accounts)||!Array.isArray(preset.apps)||!Array.isArray(preset.advanced)) return null;
    return preset;
  } catch { return null; }
}
function updatePresetChoice() {
  const exists=Boolean(savedPreset());
  $("preset-description").textContent=t(exists?"Open your saved Windows setup.":"No saved setup yet. Open to learn how to create one.");
  $("profile-preset").classList.toggle("has-preset",exists);
  if (!$("preset-panel").hidden) renderPresetPanel();
}
function renderPresetPanel() {
  const preset=savedPreset(), content=$("preset-content");
  if(!preset){content.innerHTML=`<div class="preset-empty"><strong>${t("No presets saved yet")}</strong><span>${t("Complete a setup and choose “Save as preset” on the Output page. It will appear here on this computer.")}</span></div>`;return;}
  const name=String(preset.setupName||profileDisplayName()).trim()||t("Saved Windows setup");
  const accountCount=Array.isArray(preset.accounts)?preset.accounts.length:0;
  const appCount=Array.isArray(preset.apps)?preset.apps.length:0;
  const summary=state.uiLanguage==="de"?`${accountCount} ${accountCount===1?"Konto":"Konten"} · ${appCount} App-Entfernung${appCount===1?"":"en"} · Lokal gespeichert`:`${accountCount} account${accountCount===1?"":"s"} · ${appCount} app removal${appCount===1?"":"s"} · Saved locally`;
  content.innerHTML=`<article class="saved-preset-card"><div><h3>${escapeXml(name)}</h3><p>${summary}</p></div><div class="preset-card-actions"><button class="button danger" type="button" data-delete-preset>${t("Delete")}</button><button class="button primary" type="button" data-load-preset>${t("Use preset")}</button></div></article>`;
}
function openPresetPanel() {
  renderPresetPanel();
  $("profile-list").hidden=true; $("profile-actions").hidden=true; $("preset-panel").hidden=false;
  $("preset-panel-title").focus?.();
}
function closePresetPanel() { $("preset-panel").hidden=true; $("profile-list").hidden=false; $("profile-actions").hidden=false; }
function useSavedPreset() {
  if(!savedPreset()) return;
  state.profile="preset";
  document.querySelectorAll("input[name=profile]").forEach((input)=>{input.checked=false;});
  document.querySelectorAll(".profile-option").forEach((card)=>card.classList.toggle("selected",card.id==="profile-preset"));
  loadPreset(); closePresetPanel();
}
function deleteSavedPreset() {
  if(!savedPreset()||!confirm(state.uiLanguage==="de"?"Diese gespeicherte Vorlage löschen? Dies kann nicht rückgängig gemacht werden.":"Delete this saved preset? This cannot be undone.")) return;
  try{localStorage.removeItem("unattend-studio-preset-v1");}catch{return;}
  if(state.profile==="preset"){
    state.profile="custom"; state.setupName="";
    const custom=$("profile-custom"); if(custom) custom.checked=true;
    document.querySelectorAll(".profile-option").forEach((card)=>card.classList.toggle("selected",card.dataset.profileCard==="custom"));
  }
  updatePresetChoice(); renderPresetPanel();
}
function capturePreset() {
  return {version:1,profile:state.profile,setupName:state.setupName,language:$("language").value,keyboard:$("keyboard").value,computer:$("computer").value,architecture:$("architecture").value,eula:$("eula").checked,network:$("network").checked,accounts:state.accounts.map(({name,password,isAdmin})=>({name,password,isAdmin})),apps:[...state.selectedApps],advanced:[...selectedAdvanced()],paging:{initial:$("pagefile-initial")?.value,maximum:$("pagefile-maximum")?.value}};
}
function loadPreset() {
  const preset=savedPreset(); if(!preset) { updatePresetChoice(); return; }
  state.setupName=String(preset.setupName||"").trim().slice(0,60);
  $("language").value=preset.language||"en-US"; $("keyboard").value=preset.keyboard||"en-US"; $("computer").value=preset.computer||""; $("architecture").value=preset.architecture||"amd64";
  $("eula").checked=preset.eula!==false; $("network").checked=preset.network!==false;
  state.accounts=(preset.accounts||[]).slice(0,5).map((account)=>({id:crypto.randomUUID(),name:String(account.name||""),password:String(account.password||""),isAdmin:Boolean(account.isAdmin),passwordVisible:false}));
  if(!state.accounts.length) state.accounts=[{id:crypto.randomUUID(),name:"",password:"",isAdmin:true,passwordVisible:false}];
  const savedApps=preset.apps||[];
  state.selectedApps=new Set(state.catalog.length?savedApps.filter((name)=>state.catalog.some((app)=>appKey(app)===name)):savedApps);
  document.querySelectorAll("[data-advanced]").forEach((input)=>{input.checked=(preset.advanced||[]).includes(input.dataset.advanced);input.closest(".option-wrap")?.classList.toggle("enabled",input.checked);});
  [["Enter product key interactively","Use firmware product key"],["Install Windows Recovery Environment","Remove Windows Recovery Environment"],["Custom paging file","No paging file"]].forEach((names)=>{const active=names.map((name)=>[...document.querySelectorAll("[data-advanced]")].find((input)=>input.dataset.advanced===name)).filter((input)=>input?.checked);active.slice(1).forEach((input)=>{input.checked=false;input.closest(".option-wrap")?.classList.remove("enabled");});});
  if(hasAdvanced("Automatic GPT or MBR layout")&&!hasAdvanced("Wipe and partition target disk")){const wipe=[...document.querySelectorAll("[data-advanced]")].find((input)=>input.dataset.advanced==="Wipe and partition target disk");wipe.checked=true;wipe.closest(".option-wrap")?.classList.add("enabled");}
  if(preset.paging) { $("pagefile-initial").value=preset.paging.initial||4096; $("pagefile-maximum").value=preset.paging.maximum||8192; }
  renderAccounts(); renderAppList(); updateOutput();
}

function usePreconfiguredProfile(profile, checked) {
  document.querySelectorAll("[data-preconfigured]").forEach((input) => { if (input.dataset.preconfigured !== profile) input.checked = false; });
  state.preconfigured = checked;
  if (!checked) {
    if (!state.accounts.length) state.accounts = [{id:crypto.randomUUID(),name:"",password:"",isAdmin:true,passwordVisible:false}];
    renderAccounts();
    return;
  }
  const radio = document.querySelector(`input[name="profile"][value="${profile}"]`);
  radio.checked = true;
  selectProfile(profile);
  state.accounts = [{id:crypto.randomUUID(),name:"Test",password:"Test123?",isAdmin:true,passwordVisible:false}];
  renderAccounts();
}

function renderAccounts() {
  $("accounts").innerHTML = state.accounts.map((account, index) => `
    <section class="account-row" data-account="${account.id}" style="--row-index:${index}">
      <div class="account-heading"><h2>${state.uiLanguage==="de"?"Konto":"Account"} ${index + 1}</h2>${state.accounts.length > 1 ? `<button type="button" class="remove-account" data-remove-account="${account.id}">${t("Remove")}</button>` : ""}</div>
      <div class="field-grid">
        <label>${t("Account name")}<input type="text" data-account-field="name" value="${escapeXml(account.name)}" placeholder="${index === 0 ? "Alex" : t("Account name")}" autocomplete="off"></label>
        <label>${t("Password")}<div class="password-control"><input type="${account.passwordVisible?"text":"password"}" data-account-field="password" value="${escapeXml(account.password)}" placeholder="${t("Required")}" autocomplete="new-password"><button type="button" class="password-toggle ${account.passwordVisible?"visible":""}" data-toggle-password="${account.id}" aria-label="${t(`${account.passwordVisible?"Hide":"Show"} password`)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.5"/><path class="eye-slash" d="m5 4 14 16"/></svg></button></div><small>${t("Stored as plain text inside the XML file.")}</small></label>
      </div>
      <label class="admin-check"><input type="checkbox" data-account-field="isAdmin" ${account.isAdmin ? "checked" : ""}><span><strong>${t("Is administrator")}</strong><small>${t("Can install software and change system settings.")}</small></span></label>
    </section>`).join("");
  $("add-account").disabled = state.accounts.length >= 5;
}

function renderAppList() {
  const query = $("app-search").value.trim().toLowerCase();
  const visible = state.catalog.filter((app) => app.DisplayName.toLowerCase().includes(query));
  $("bloatware-list").innerHTML = visible.length ? visible.map((app, index) => {
    const name = appKey(app);
    const isCore = coreApps.has(name);
    const selectors = appSelectors(app,"PackageBloatwareStep").length + appSelectors(app,"CapabilityBloatwareStep").length + appSelectors(app,"OptionalFeatureBloatwareStep").length;
    const detail = selectors ? (state.uiLanguage==="de"?`${selectors} Entfernungsregel${selectors===1?"":"n"}`:`${selectors} removal rule${selectors === 1 ? "" : "s"}`) : t("special removal rule");
    return `<label class="app-row" style="--row-index:${Math.min(index,12)}"><input type="checkbox" data-app="${escapeXml(name)}" ${state.selectedApps.has(name)?"checked":""}><span><strong>${escapeXml(name)}</strong><small>${detail}${isCore?` · ${t("Windows component, harder to restore")}`:""}</small></span></label>`;
  }).join("") : `<p class="loading">${t("No apps match that search.")}</p>`;
  updateAppCount();
}

function updateAppCount() {
  const count = state.selectedApps.size;
  $("app-count").textContent = state.uiLanguage==="de"?`${count} App${count===1?"":"s"} ausgewählt`:`${count} app${count === 1 ? "" : "s"} selected`;
}

function renderAdvancedOptions() {
  $("advanced-options").innerHTML = Object.entries(advancedGroups).map(([group,options]) => {
    return `<details class="option-group"><summary>${escapeXml(t(group))}<span>${options.length}</span></summary><div class="option-group-body">${options.map((option) => `<div class="option-wrap"><label class="option-row"><input type="checkbox" data-advanced="${escapeXml(option)}"><span><strong>${escapeXml(t(option))}</strong>${advancedHelp[option]?`<small>${escapeXml(t(advancedHelp[option]))}</small>`:""}</span></label>${option==="Custom paging file"?`<div class="inline-settings" data-for="Custom paging file"><label>${t("Initial size")}<input id="pagefile-initial" type="number" min="256" max="131072" value="4096"><small>MB</small></label><label>${t("Maximum size")}<input id="pagefile-maximum" type="number" min="256" max="131072" value="8192"><small>MB</small></label></div>`:""}</div>`).join("")}</div></details>`;
  }).join("");
}

function applyAdvancedPreset(name) {
  const chosen=new Set(advancedPresets[name]||[]);
  document.querySelectorAll("[data-advanced]").forEach((input)=>{
    input.checked=chosen.has(input.dataset.advanced);
    input.closest(".option-wrap")?.classList.toggle("enabled",input.checked);
  });
  document.querySelectorAll("[data-advanced-preset]").forEach((button)=>{
    const active=button.dataset.advancedPreset===name;
    button.classList.toggle("active",active); button.setAttribute("aria-pressed",String(active));
  });
  document.querySelectorAll(".option-group").forEach((group)=>{group.open=Boolean(group.querySelector("[data-advanced]:checked"));});
  updateOutput();
}

function quotePowerShell(value) { return `'${String(value).replaceAll("'","''")}'`; }
function removalScript() {
  const chosen = state.catalog.filter((app) => state.selectedApps.has(appKey(app)));
  const packages = [...new Set(chosen.flatMap((app) => appSelectors(app,"PackageBloatwareStep")))];
  const capabilities = [...new Set(chosen.flatMap((app) => appSelectors(app,"CapabilityBloatwareStep")))];
  const features = [...new Set(chosen.flatMap((app) => appSelectors(app,"OptionalFeatureBloatwareStep")))];
  const names = new Set(chosen.map(appKey));
  const lines = ["$ErrorActionPreference = 'Continue'","$log = 'C:\\Windows\\Setup\\Scripts\\UnattendStudio-Debloat.log'","'Starting selected app removal' | Out-File $log"];
  if (packages.length) { lines.push(`$packages = @(${packages.map(quotePowerShell).join(",")})`); lines.push("foreach ($name in $packages) { Get-AppxProvisionedPackage -Online | Where-Object DisplayName -EQ $name | Remove-AppxProvisionedPackage -Online -AllUsers -ErrorAction Continue | Out-File $log -Append; Get-AppxPackage -AllUsers -Name $name | ForEach-Object { Remove-AppxPackage -Package $_.PackageFullName -AllUsers -ErrorAction Continue } }"); }
  if (capabilities.length) { lines.push(`$capabilities = @(${capabilities.map(quotePowerShell).join(",")})`); lines.push("foreach ($name in $capabilities) { Get-WindowsCapability -Online | Where-Object Name -Like ($name + '*') | Remove-WindowsCapability -Online -ErrorAction Continue | Out-File $log -Append }"); }
  if (features.length) { lines.push(`$features = @(${features.map(quotePowerShell).join(",")})`); lines.push("foreach ($name in $features) { Disable-WindowsOptionalFeature -Online -FeatureName $name -NoRestart -ErrorAction Continue | Out-File $log -Append }"); }
  if (names.has("OneDrive")) lines.push("$oneDrive = if (Test-Path $env:SystemRoot\\SysWOW64\\OneDriveSetup.exe) { $env:SystemRoot + '\\SysWOW64\\OneDriveSetup.exe' } else { $env:SystemRoot + '\\System32\\OneDriveSetup.exe' }; if (Test-Path $oneDrive) { Start-Process $oneDrive '/uninstall' -Wait }");
  if (names.has("Xbox Apps")) lines.push("reg.exe add 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\GameDVR' /v AppCaptureEnabled /t REG_DWORD /d 0 /f; reg.exe add 'HKCU\\System\\GameConfigStore' /v GameDVR_Enabled /t REG_DWORD /d 0 /f");
  lines.push("'Selected app removal finished' | Out-File $log -Append");
  return lines.join(";\r\n");
}

function selectedAdvanced() { return new Set([...document.querySelectorAll("[data-advanced]:checked")].map((input) => input.dataset.advanced)); }
function hasAdvanced(name) { return selectedAdvanced().has(name); }
function reg(root,path,name,type,value) { return `reg.exe add '${root}\\${path}' /v '${name}' /t ${type} /d ${quotePowerShell(value)} /f`; }
function explorerPreferencesScript(root,retry=false) {
  const selected=selectedAdvanced();
  const values=[];
  if(selected.has("Always show file extensions")) values.push("'HideFileExt'=0");
  if(selected.has("Show hidden files")) values.push("'Hidden'=1");
  if(!values.length) return "";
  const assignments=values.join(";");
  const attempts=retry?5:1;
  return `function Set-UnattendExplorerPreferences { $path='Registry::${root}\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced'; New-Item -Path $path -Force | Out-Null; $values=@{${assignments}}; foreach($entry in $values.GetEnumerator()){ New-ItemProperty -Path $path -Name $entry.Key -PropertyType DWord -Value $entry.Value -Force -ErrorAction Stop | Out-Null; if((Get-ItemPropertyValue -Path $path -Name $entry.Key -ErrorAction Stop) -ne $entry.Value){ throw "Explorer preference verification failed: $($entry.Key)" } } }; for($attempt=0;$attempt -lt ${attempts};$attempt++){ Set-UnattendExplorerPreferences; if($attempt -lt ${attempts-1}){ Start-Sleep -Seconds 1 } }; Remove-Item Function:\\Set-UnattendExplorerPreferences`;
}
function perUserCommands(defaultUser=false) {
  const selected=selectedAdvanced(), root=defaultUser?"HKU":"HKCU", prefix=defaultUser?"DefaultUser\\":"", lines=[];
  const add=(name,...commands)=>{if(selected.has(name)) lines.push(...commands);};
  const userReg=(path,name,type,value)=>reg(root,`${prefix}${path}`,name,type,value);
  add("Use classic context menu",`reg.exe add '${root}\\${prefix}Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32' /ve /f`);
  add("Open File Explorer to This PC",userReg("Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced","LaunchTo","REG_DWORD",1));
  add("Hide taskbar search",userReg("Software\\Microsoft\\Windows\\CurrentVersion\\Search","SearchboxTaskbarMode","REG_DWORD",0));
  add("Hide widgets",userReg("Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced","TaskbarDa","REG_DWORD",0));
  add("Disable advertising ID",userReg("Software\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo","Enabled","REG_DWORD",0));
  add("Disable app launch tracking",userReg("Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced","Start_TrackProgs","REG_DWORD",0));
  return lines;
}
function accountCaseScript() {
  if(!state.accounts.length) return "";
  const calls=state.accounts.map((account)=>`Set-UnattendCaseFix -DesiredName ${quotePowerShell(account.name.trim())}`).join(";\r\n");
  return `function Set-UnattendCaseFix { param([string]$DesiredName); $account=Get-LocalUser -Name $DesiredName -ErrorAction SilentlyContinue; if($account -and $account.Name -cne $DesiredName){$temporary='_ugCase_'+$account.SID.Value.Split('-')[-1];Rename-LocalUser -SID $account.SID -NewName $temporary;Rename-LocalUser -Name $temporary -NewName $DesiredName} };\r\n${calls};\r\nRemove-Item Function:\\Set-UnattendCaseFix`;
}

function advancedSystemScript() {
  const selected=selectedAdvanced(), lines=["$ErrorActionPreference = 'Continue'","$log = 'C:\\Windows\\Setup\\Scripts\\UnattendStudio-System.log'","'Applying system settings' | Out-File $log"];
  const add=(name,...commands)=>{if(selected.has(name)) lines.push(...commands);};
  if($("network").checked) lines.push(reg("HKLM","SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\OOBE","BypassNRO","REG_DWORD",1),reg("HKLM","SYSTEM\\Setup\\LabConfig","BypassNRO","REG_DWORD",1));
  add("Allow setup without internet",reg("HKLM","SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\OOBE","BypassNRO","REG_DWORD",1));
  add("Skip network page automatically",reg("HKLM","SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\OOBE","BypassNRO","REG_DWORD",1),reg("HKLM","SYSTEM\\Setup\\LabConfig","BypassNRO","REG_DWORD",1));
  add("Prevent automatic device encryption",reg("HKLM","SYSTEM\\CurrentControlSet\\Control\\BitLocker","PreventDeviceEncryption","REG_DWORD",1));
  add("Disable Windows Defender",
    reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Windows Defender","DisableAntiSpyware","REG_DWORD",1),
    reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Windows Defender","DisableRealtimeMonitoring","REG_DWORD",1),
    "Set-MpPreference -DisableRealtimeMonitoring $true -DisableBehaviorMonitoring $true -DisableIOAVProtection $true -ErrorAction Continue",
    "'Sense','WdBoot','WdFilter','WdNisDrv','WdNisSvc','WinDefend' | ForEach-Object { reg.exe add (\"HKLM\\SYSTEM\\CurrentControlSet\\Services\\$_\") /v Start /t REG_DWORD /d 4 /f }");
  add("Disable SmartScreen",
    reg("HKLM","SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer","SmartScreenEnabled","REG_SZ","Off"),
    reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Windows\\System","EnableSmartScreen","REG_DWORD",0));
  add("Disable telemetry",
    reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection","AllowTelemetry","REG_DWORD",0),
    reg("HKLM","SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection","AllowTelemetry","REG_DWORD",0),
    "'DiagTrack','dmwappushservice' | ForEach-Object { Stop-Service $_ -Force -ErrorAction SilentlyContinue; Set-Service $_ -StartupType Disabled -ErrorAction SilentlyContinue }");
  add("Disable activity history",
    reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Windows\\System","EnableActivityFeed","REG_DWORD",0),
    reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Windows\\System","PublishUserActivities","REG_DWORD",0),
    reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Windows\\System","UploadUserActivities","REG_DWORD",0));
  add("Disable location services",reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Windows\\LocationAndSensors","DisableLocation","REG_DWORD",1));
  add("Disable Windows Spotlight",reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent","DisableWindowsSpotlightFeatures","REG_DWORD",1));
  add("Hide widgets",reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Dsh","AllowNewsAndInterests","REG_DWORD",0));
  add("Remove Start menu pins",reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Windows\\Explorer","ConfigureStartPins","REG_SZ",'{"pinnedList":[]}'));
  add("Disable hibernation","powercfg.exe /hibernate off");
  add("Disable first-logon animation",reg("HKLM","SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System","EnableFirstLogonAnimation","REG_DWORD",0));
  add("Disable automatic driver delivery",reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate","ExcludeWUDriversInQualityUpdate","REG_DWORD",1));
  add("Prevent update restarts while signed in",reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU","NoAutoRebootWithLoggedOnUsers","REG_DWORD",1));
  add("Disable Delivery Optimization",reg("HKLM","SOFTWARE\\Policies\\Microsoft\\Windows\\DeliveryOptimization","DODownloadMode","REG_DWORD",0));
  add("Install Windows Recovery Environment","reagentc.exe /enable");
  add("Remove Windows Recovery Environment","reagentc.exe /disable","Remove-Item -LiteralPath 'C:\\Windows\\System32\\Recovery\\Winre.wim' -Force -ErrorAction SilentlyContinue");
  if(selected.has("Custom paging file")) {
    const initial=Number($("pagefile-initial")?.value||4096), maximum=Number($("pagefile-maximum")?.value||8192);
    lines.push("Get-CimInstance Win32_ComputerSystem | Set-CimInstance -Property @{AutomaticManagedPagefile=$false}","Get-CimInstance Win32_PageFileSetting | Remove-CimInstance -ErrorAction SilentlyContinue",`New-CimInstance -ClassName Win32_PageFileSetting -Property @{Name='C:\\\\pagefile.sys';InitialSize=${initial};MaximumSize=${maximum}}`);
  }
  add("No paging file","Get-CimInstance Win32_ComputerSystem | Set-CimInstance -Property @{AutomaticManagedPagefile=$false}","Get-CimInstance Win32_PageFileSetting | Remove-CimInstance -ErrorAction SilentlyContinue");
  add("Enable Windows Sandbox","Enable-WindowsOptionalFeature -Online -FeatureName 'Containers-DisposableClientVM' -All -NoRestart");
  add("Enable Windows Subsystem for Linux","Enable-WindowsOptionalFeature -Online -FeatureName 'Microsoft-Windows-Subsystem-Linux' -All -NoRestart","Enable-WindowsOptionalFeature -Online -FeatureName 'VirtualMachinePlatform' -All -NoRestart");
  const defaults=perUserCommands(true), explorerDefaults=explorerPreferencesScript("HKEY_USERS\\DefaultUser");
  if(defaults.length||explorerDefaults) lines.push("reg.exe load 'HKU\\DefaultUser' 'C:\\Users\\Default\\NTUSER.DAT'",...defaults,...(explorerDefaults?[explorerDefaults]:[]),"reg.exe unload 'HKU\\DefaultUser'");
  if(state.selectedApps.size) lines.push(removalScript());
  lines.push("'System settings complete' | Out-File $log -Append");
  return lines.join(";\r\n");
}

function advancedUserScript() {
  const selected=selectedAdvanced(), lines=["$ErrorActionPreference = 'Continue'","$log = 'C:\\Windows\\Setup\\Scripts\\UnattendStudio-User.log'"];
  const add=(name,...commands)=>{if(selected.has(name)) lines.push(...commands);};
  lines.push(accountCaseScript());
  lines.push(...perUserCommands(false));
  const explorerPreferences=explorerPreferencesScript("HKEY_CURRENT_USER",true);
  if(explorerPreferences) lines.push(explorerPreferences);
  const vmScripts={
    "Install VirtualBox Guest Additions":"foreach($d in 'D'..'Z'){ $e=\"${d}:\\VBoxWindowsAdditions.exe\"; if(Test-Path $e){ Start-Process $e -ArgumentList '/with_wddm','/S' -Wait; break } }",
    "Install VMware Tools":"foreach($d in 'D'..'Z'){ $e=\"${d}:\\setup.exe\"; if((Get-Item $e -ErrorAction SilentlyContinue).VersionInfo.ProductName -eq 'VMware Tools'){ Start-Process $e -ArgumentList '/s','/v','/qn REBOOT=R' -Wait; break } }",
    "Install VirtIO tools":"foreach($d in 'D'..'Z'){ $e=\"${d}:\\virtio-win-guest-tools.exe\"; if(Test-Path $e){ Start-Process $e -ArgumentList '/passive','/norestart' -Wait; break } }",
    "Install Parallels Tools":"foreach($d in 'D'..'Z'){ $e=\"${d}:\\PTAgent.exe\"; if(Test-Path $e){ Start-Process $e -ArgumentList '/install_silent' -Wait; break } }"
  };
  Object.entries(vmScripts).forEach(([name,script])=>add(name,script));
  lines.push("Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue","'User settings complete' | Out-File $log -Append");
  return lines.join(";\r\n");
}

function extractionScript() { return "param([xml]$Document); foreach($file in $Document.unattend.Extensions.File){$path=[Environment]::ExpandEnvironmentVariables($file.GetAttribute('path'));New-Item -ItemType Directory -Path (Split-Path $path -Parent) -Force|Out-Null;[IO.File]::WriteAllText($path,$file.InnerText.Trim(),[Text.UTF8Encoding]::new($true))}"; }
function extensionXml(files) { return `<Extensions xmlns="https://schneegans.de/windows/unattend-generator/"><ExtractScript>${escapeXml(extractionScript())}</ExtractScript>${files.map(([path,content])=>`<File path="${escapeXml(path)}">${escapeXml(content)}</File>`).join("")}</Extensions>`; }
function psCommand(command,hidden=false) { return `powershell.exe -WindowStyle ${hidden?"Hidden":"Normal"} -NoProfile -ExecutionPolicy Bypass -Command &quot;${escapeXml(command)}&quot;`; }

function accountXml() {
  if (!state.accounts.length) return "";
  const accounts = state.accounts.map((account) => {
    const name = account.name.trim();
    const password = account.password ? `<Password><Value>${escapeXml(account.password)}</Value><PlainText>true</PlainText></Password>` : "";
    return `<LocalAccount wcm:action="add">${password}<Name>${escapeXml(name)}</Name><DisplayName>${escapeXml(name)}</DisplayName><Group>${account.isAdmin?"Administrators":"Users"}</Group></LocalAccount>`;
  }).join("");
  return `<UserAccounts><LocalAccounts>${accounts}</LocalAccounts></UserAccounts>`;
}

function autoLogonXml() {
  if ((!hasAdvanced("Sign in automatically once")&&!hasAdvanced("Skip network page automatically")&&!$("network").checked) || !state.accounts.length) return "";
  const account=state.accounts[0];
  return `<AutoLogon><Enabled>true</Enabled><LogonCount>1</LogonCount><Username>${escapeXml(account.name.trim())}</Username><Password><Value>${escapeXml(account.password)}</Value><PlainText>true</PlainText></Password></AutoLogon>`;
}

function generatedXml() {
  const language=$("language").value, keyboard=$("keyboard").value, architecture=$("architecture").value;
  const computer=$("computer").value.trim() || "DESKTOP-PC";
  const selected=selectedAdvanced(), hidden=selected.has("Hide PowerShell windows");
  const skipOobe=$("network").checked||selected.has("Skip network page automatically");
  const systemPath="C:\\Windows\\Setup\\Scripts\\UnattendStudio-System.ps1", userPath="C:\\Windows\\Setup\\Scripts\\UnattendStudio-User.ps1";
  const files=[[systemPath,advancedSystemScript()],[userPath,advancedUserScript()]];
  const extractor="$xml=[xml]::new();$xml.Load('C:\\Windows\\Panther\\unattend.xml');$sb=[scriptblock]::Create($xml.unattend.Extensions.ExtractScript);Invoke-Command -ScriptBlock $sb -ArgumentList $xml;";
  const specialize=`<settings pass="specialize"><component name="Microsoft-Windows-Deployment" processorArchitecture="${architecture}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS"><RunSynchronous><RunSynchronousCommand wcm:action="add"><Order>1</Order><Description>Extract local customization scripts</Description><Path>${psCommand(extractor,hidden)}</Path></RunSynchronousCommand><RunSynchronousCommand wcm:action="add"><Order>2</Order><Description>Apply system settings and remove selected apps</Description><Path>powershell.exe -WindowStyle ${hidden?"Hidden":"Normal"} -NoProfile -ExecutionPolicy Bypass -File &quot;${systemPath}&quot;</Path></RunSynchronousCommand></RunSynchronous></component></settings>`;
  const firstLogon=`<FirstLogonCommands><SynchronousCommand wcm:action="add"><Order>1</Order><Description>Apply settings for the first account</Description><CommandLine>powershell.exe -WindowStyle ${hidden?"Hidden":"Normal"} -NoProfile -ExecutionPolicy Bypass -File &quot;${userPath}&quot;</CommandLine></SynchronousCommand></FirstLogonCommands>`;
  const peCommands=[];
  if(selected.has("Run Windows PE interactively")) peCommands.push("cmd.exe /c start /wait cmd.exe");
  if(selected.has("Bypass Windows 11 requirements")) peCommands.push("cmd.exe /c for %v in (TPM SecureBoot RAM CPU Storage) do reg.exe add HKLM\\SYSTEM\\Setup\\LabConfig /v Bypass%vCheck /t REG_DWORD /d 1 /f");
  if(selected.has("Wipe and partition target disk")) {
    const auto=selected.has("Automatic GPT or MBR layout");
    const diskpart=auto
      ? "cmd.exe /c (reg query HKLM\\SYSTEM\\CurrentControlSet\\Control /v PEFirmwareType | find \"0x2\" >nul && (echo select disk 0&echo clean&echo convert gpt&echo create partition efi size=100&echo format quick fs=fat32&echo create partition msr size=16&echo create partition primary&echo format quick fs=ntfs) || (echo select disk 0&echo clean&echo convert mbr&echo create partition primary&echo format quick fs=ntfs&echo active)) > X:\\UnattendDisk.txt & diskpart.exe /s X:\\UnattendDisk.txt"
      : "cmd.exe /c (echo select disk 0&echo clean&echo convert gpt&echo create partition efi size=100&echo format quick fs=fat32&echo create partition msr size=16&echo create partition primary&echo format quick fs=ntfs) > X:\\UnattendDisk.txt & diskpart.exe /s X:\\UnattendDisk.txt";
    peCommands.push(diskpart);
  }
  const runPe=peCommands.length?`<RunSynchronous>${peCommands.map((path,index)=>`<RunSynchronousCommand wcm:action="add"><Order>${index+1}</Order><Path>${escapeXml(path)}</Path></RunSynchronousCommand>`).join("")}</RunSynchronous>`:"";
  const productKey=selected.has("Enter product key interactively")?"<ProductKey><Key>00000-00000-00000-00000-00000</Key><WillShowUI>Always</WillShowUI></ProductKey>":selected.has("Use firmware product key")?"<ProductKey><WillShowUI>Never</WillShowUI></ProductKey>":"";
  const installImage=(selected.has("Select Windows image interactively")||selected.has("Wipe and partition target disk"))?`<ImageInstall><OSImage>${selected.has("Select Windows image interactively")?"<WillShowUI>Always</WillShowUI>":""}${selected.has("Wipe and partition target disk")?"<InstallToAvailablePartition>true</InstallToAvailablePartition>":""}</OSImage></ImageInstall>`:"";
  return `<?xml version="1.0" encoding="utf-8"?>
<unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State">
  <settings pass="windowsPE"><component name="Microsoft-Windows-International-Core-WinPE" processorArchitecture="${architecture}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS"><InputLocale>${keyboard}</InputLocale><SystemLocale>${language}</SystemLocale><UILanguage>${language}</UILanguage><UserLocale>${language}</UserLocale></component><component name="Microsoft-Windows-Setup" processorArchitecture="${architecture}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">${installImage}<UserData>${productKey}<AcceptEula>${$("eula").checked}</AcceptEula></UserData>${runPe}</component></settings>
  ${specialize}
  <settings pass="oobeSystem"><component name="Microsoft-Windows-International-Core" processorArchitecture="${architecture}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS"><InputLocale>${keyboard}</InputLocale><SystemLocale>${language}</SystemLocale><UILanguage>${language}</UILanguage><UserLocale>${language}</UserLocale></component><component name="Microsoft-Windows-Shell-Setup" processorArchitecture="${architecture}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS"><ComputerName>${escapeXml(computer)}</ComputerName>${accountXml()}${autoLogonXml()}<OOBE><HideEULAPage>${$("eula").checked}</HideEULAPage><HideWirelessSetupInOOBE>${skipOobe}</HideWirelessSetupInOOBE><HideOnlineAccountScreens>${state.accounts.length>0||skipOobe}</HideOnlineAccountScreens>${skipOobe?"<HideOEMRegistrationScreen>true</HideOEMRegistrationScreen><SkipMachineOOBE>true</SkipMachineOOBE><SkipUserOOBE>true</SkipUserOOBE>":""}<ProtectYourPC>3</ProtectYourPC></OOBE>${firstLogon}</component></settings>
  ${extensionXml(files)}
</unattend>`;
}

function validateBasics() {
  const computer=$("computer").value.trim();
  if (computer && (!/^[A-Za-z0-9-]{1,15}$/.test(computer) || /^\d+$/.test(computer))) { alert(state.uiLanguage==="de"?"Verwende 1 bis 15 Buchstaben, Zahlen oder Bindestriche für den Computernamen. Er darf nicht nur aus Zahlen bestehen.":"Use 1 to 15 letters, numbers or hyphens for the computer name. It cannot contain only numbers."); showPage(1); $("computer").focus(); return false; }
  return true;
}

function showAccountError(message,index=0,field="name") {
  if (state.page!==2) showPage(2);
  $("account-error").textContent=message;
  $("account-error").hidden=false;
  const row=document.querySelectorAll("[data-account]")[index];
  row?.classList.add("invalid");
  row?.querySelector(`[data-account-field="${field}"]`)?.focus();
}

function validateAccounts() {
  $("account-error").hidden=true;
  document.querySelectorAll("[data-account]").forEach((row)=>row.classList.remove("invalid"));
  if (state.preconfigured && !state.accounts.length) return true;
  if (!state.accounts.length) { showAccountError(state.uiLanguage==="de"?"Füge mindestens ein Konto mit Name und Passwort hinzu.":"Add at least one account, including its name and password."); return false; }
  const incomplete=state.accounts.findIndex((account)=>!account.name.trim() || !account.password);
  if (incomplete>=0) { const missing=state.accounts[incomplete].name.trim()?"password":"name"; const message=state.uiLanguage==="de"?`Konto ${incomplete+1} benötigt ${missing==="password"?"ein Passwort":"einen Namen"}, bevor du fortfahren kannst.`:`Account ${incomplete+1} needs a ${missing} before you can continue.`; showAccountError(message,incomplete,missing); return false; }
  const names=state.accounts.map((account)=>account.name.trim());
  const reserved=new Set(["administrator","defaultaccount","guest","wdagutilityaccount","con","prn","aux","nul"]);
  const invalid=names.findIndex((name)=>!/^[-_. A-Za-z0-9]{1,20}$/.test(name) || /[. ]$/.test(name) || reserved.has(name.toLowerCase()));
  if (invalid>=0) { showAccountError(state.uiLanguage==="de"?"Verwende einen eindeutigen Kontonamen mit höchstens 20 Zeichen. Reservierte Windows-Namen sowie Namen mit abschließendem Leerzeichen oder Punkt sind nicht erlaubt.":"Use a unique account name up to 20 characters. Reserved Windows names and names ending in a space or period are not allowed.",invalid); return false; }
  if (new Set(names.map((name)=>name.toLowerCase())).size !== names.length) { showAccountError(state.uiLanguage==="de"?"Jedes lokale Konto benötigt einen eindeutigen Namen.":"Each local account needs a unique name."); return false; }
  if ((state.selectedApps.size || selectedAdvanced().size) && state.accounts.length && !state.accounts.some((account)=>account.isAdmin)) { showAccountError(state.uiLanguage==="de"?"App-Entfernung und erweiterte Änderungen benötigen mindestens ein Administratorkonto.":"App removal and advanced changes need at least one administrator account."); return false; }
  return true;
}

function validateAdvanced() {
  if (!hasAdvanced("Custom paging file")) return true;
  const initial=Number($("pagefile-initial").value), maximum=Number($("pagefile-maximum").value);
  if (!Number.isInteger(initial)||!Number.isInteger(maximum)||initial<256||maximum<initial||maximum>131072) {
    alert(state.uiLanguage==="de"?"Größen der Auslagerungsdatei müssen ganze Zahlen zwischen 256 und 131072 MB sein. Die Maximalgröße darf nicht kleiner als die Anfangsgröße sein.":"Paging file sizes must be whole numbers from 256 to 131072 MB, and the maximum cannot be smaller than the initial size.");
    showPage(4); $("pagefile-initial").focus(); return false;
  }
  return true;
}

function validateStep(page) {
  if (page===1) return validateBasics();
  if (page>=4) return validateBasics() && validateAccounts() && validateAdvanced();
  if (page>=2) return validateBasics() && validateAccounts();
  return true;
}

function validateConfiguration() { return validateBasics() && validateAccounts() && validateAdvanced(); }

function profileDisplayName() { return t({minimal:"Lean Windows",standard:"Clean Windows",custom:"Custom setup",preset:"Saved preset"}[state.profile]||"Custom setup"); }
function commitSetupName(input) {
  if(!input?.isConnected) return;
  state.setupName=input.value.trim().slice(0,60);
  renderReview();
}
function editSetupName() {
  const value=state.setupName||profileDisplayName(), valueCell=$("setup-name")?.parentElement;
  if(!valueCell) return;
  valueCell.innerHTML=`<label class="sr-only" for="setup-name-input">${t("Setup name")}</label><input id="setup-name-input" class="setup-name-input" type="text" maxlength="60" value="${escapeXml(value)}">`;
  const input=$("setup-name-input"); input.focus(); input.select();
  input.addEventListener("blur",()=>commitSetupName(input),{once:true});
  input.addEventListener("keydown",(event)=>{if(event.key==="Enter"){event.preventDefault();commitSetupName(input);}if(event.key==="Escape"){event.preventDefault();renderReview();}});
}

function renderReview() {
  const adminCount=state.accounts.filter((account)=>account.isAdmin).length;
  const accountSummary=state.accounts.length?(state.uiLanguage==="de"?`${state.accounts.length} (${adminCount} Administrator${adminCount===1?"":"en"})`:`${state.accounts.length} (${adminCount} administrator${adminCount===1?"":"s"})`):(state.uiLanguage==="de"?"Während des Windows-Setups erstellen":"Create during Windows setup");
  const setupName=state.setupName||profileDisplayName();
  const rows=[[state.uiLanguage==="de"?"Computer":"Computer",$("computer").value.trim()||"DESKTOP-PC"],[t("Accounts"),accountSummary],[state.uiLanguage==="de"?"Entfernte Apps":"Apps removed",String(state.selectedApps.size)],[state.uiLanguage==="de"?"Erweiterte Änderungen":"Advanced changes",String(document.querySelectorAll("[data-advanced]:checked").length)]];
  $("review").innerHTML=`<div class="review-row"><dt>${t("Setup style")}</dt><dd class="editable-value"><span id="setup-name">${escapeXml(setupName)}</span><button id="edit-setup-name" class="edit-name" type="button" aria-label="${t("Rename setup")}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15.5 5.5 3 3M5 19l3.8-.8L19 7a1.4 1.4 0 0 0 0-2l0 0a1.4 1.4 0 0 0-2 0L5.8 15.2 5 19Z"/></svg></button></dd></div>${rows.map(([term,value])=>`<div class="review-row"><dt>${escapeXml(term)}</dt><dd>${escapeXml(value)}</dd></div>`).join("")}`;
  $("preview").textContent=generatedXml();
}

function updateOutput() { if (state.page===5) renderReview(); }
function downloadXml() {
  const link=document.createElement("a"), url=URL.createObjectURL(new Blob([generatedXml()],{type:"application/xml"}));
  link.href=url; link.download="autounattend.xml"; link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

document.addEventListener("click",(event)=>{
  const next=event.target.closest(".next"), back=event.target.closest(".back"), go=event.target.closest("[data-go]"), remove=event.target.closest("[data-remove-account]"), passwordToggle=event.target.closest("[data-toggle-password]"), editName=event.target.closest("#edit-setup-name");
  if (next && validateStep(state.page)) { if(state.page===0&&state.preconfigured){state.completed=new Set([0,1,2,3,4]);showPage(5);}else{state.completed.add(state.page);showPage(state.page+1);} }
  if (back) showPage(state.page-1);
  if (go) { const target=Number(go.dataset.go); if ((target===state.page || state.completed.has(target)) && (target<=state.page || validateConfiguration())) showPage(target); }
  if (remove) { state.accounts=state.accounts.filter((account)=>account.id!==remove.dataset.removeAccount); renderAccounts(); updateOutput(); }
  if (passwordToggle) { const account=state.accounts.find((item)=>item.id===passwordToggle.dataset.togglePassword); const input=passwordToggle.parentElement.querySelector("input"); if(account&&input){account.passwordVisible=!account.passwordVisible;input.type=account.passwordVisible?"text":"password";passwordToggle.classList.toggle("visible",account.passwordVisible);passwordToggle.setAttribute("aria-label",t(`${account.passwordVisible?"Hide":"Show"} password`));} }
  if (editName) { event.preventDefault(); editSetupName(); }
});
document.addEventListener("input",(event)=>{
  const app=event.target.closest("[data-app]");
  if (app) { app.checked?state.selectedApps.add(app.dataset.app):state.selectedApps.delete(app.dataset.app); updateAppCount(); updateOutput(); }
  const accountField=event.target.dataset.accountField;
  if (accountField) { const row=event.target.closest("[data-account]"); const account=state.accounts.find((item)=>item.id===row.dataset.account); if (account) account[accountField]=accountField==="isAdmin"?event.target.checked:event.target.value; row.classList.remove("invalid"); $("account-error").hidden=true; updateOutput(); }
  const advanced=event.target.closest("[data-advanced]");
  if (advanced) {
    document.querySelectorAll("[data-advanced-preset]").forEach((button)=>{button.classList.remove("active");button.setAttribute("aria-pressed","false");});
    (exclusiveAdvanced[advanced.dataset.advanced]||[]).forEach((name)=>{const other=[...document.querySelectorAll("[data-advanced]")].find((input)=>input.dataset.advanced===name);if(other){other.checked=false;other.closest(".option-wrap")?.classList.remove("enabled");}});
    if(advanced.dataset.advanced==="Automatic GPT or MBR layout"&&advanced.checked){const wipe=[...document.querySelectorAll("[data-advanced]")].find((input)=>input.dataset.advanced==="Wipe and partition target disk");wipe.checked=true;wipe.closest(".option-wrap")?.classList.add("enabled");}
    if(advanced.dataset.advanced==="Wipe and partition target disk"&&!advanced.checked){const auto=[...document.querySelectorAll("[data-advanced]")].find((input)=>input.dataset.advanced==="Automatic GPT or MBR layout");auto.checked=false;auto.closest(".option-wrap")?.classList.remove("enabled");}
    advanced.closest(".option-wrap")?.classList.toggle("enabled",advanced.checked); updateOutput();
  }
});
document.querySelectorAll("input[name=profile]").forEach((input)=>input.addEventListener("change",()=>{ document.querySelectorAll("[data-preconfigured]").forEach((box)=>{box.checked=false;}); state.preconfigured=false; if(!state.accounts.length){state.accounts=[{id:crypto.randomUUID(),name:"",password:"",isAdmin:true,passwordVisible:false}];renderAccounts();} selectProfile(input.value); }));
document.querySelectorAll("[data-preconfigured]").forEach((input)=>input.addEventListener("change",()=>usePreconfiguredProfile(input.dataset.preconfigured,input.checked)));
document.querySelectorAll("[data-preset]").forEach((button)=>button.addEventListener("click",()=>applyPreset(button.dataset.preset)));
document.querySelectorAll("[data-advanced-preset]").forEach((button)=>button.addEventListener("click",()=>applyAdvancedPreset(button.dataset.advancedPreset)));
$("profile-preset").addEventListener("click",openPresetPanel);
document.querySelector("[data-close-presets]").addEventListener("click",closePresetPanel);
$("preset-content").addEventListener("click",(event)=>{if(event.target.closest("[data-load-preset]"))useSavedPreset();if(event.target.closest("[data-delete-preset]"))deleteSavedPreset();});
$("language-toggle").addEventListener("click",()=>applyUiLanguage(state.uiLanguage==="en"?"de":"en"));
$("theme-toggle").addEventListener("click",()=>{const theme=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=theme;try{localStorage.setItem("unattend-studio-theme",theme);}catch{}updateThemeToggle();});
$("add-account").addEventListener("click",()=>{ if (state.accounts.length>=5) return; state.accounts.push({id:crypto.randomUUID(),name:"",password:"",isAdmin:false,passwordVisible:false}); renderAccounts(); requestAnimationFrame(()=>$("accounts").lastElementChild?.querySelector("input")?.focus()); });
$("app-search").addEventListener("input",renderAppList);
$("copy").addEventListener("click",async()=>{ await navigator.clipboard.writeText(generatedXml()); $("copy").textContent=t("Copied"); setTimeout(()=>{$("copy").textContent=t("Copy XML");},1200); });
$("save-preset").addEventListener("click",()=>{ if(!validateConfiguration()) return; try{localStorage.setItem("unattend-studio-preset-v1",JSON.stringify(capturePreset()));updatePresetChoice();$("save-preset").textContent=t("Preset saved");setTimeout(()=>{$("save-preset").textContent=t("Save as preset");},1400);}catch{alert(state.uiLanguage==="de"?"Der Browser konnte die Vorlage nicht lokal speichern.":"This browser did not allow the preset to be saved locally.");} });
$("finish").addEventListener("click",()=>{ if (validateConfiguration()) downloadXml(); });

function updateThemeToggle(){const dark=document.documentElement.dataset.theme==="dark";$("theme-toggle").setAttribute("aria-label",t(`Switch to ${dark?"light":"dark"} mode`));$("theme-toggle").setAttribute("aria-pressed",String(dark));$("theme-toggle").querySelector(".theme-label").textContent=t(dark?"Night":"Day");}

renderAccounts(); renderAdvancedOptions(); updatePresetChoice(); updateStepNavigation(); applyUiLanguage(state.uiLanguage,false);
fetch("resource/Bloatware.json").then((response)=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();}).then((catalog)=>{state.catalog=catalog.sort((a,b)=>a.DisplayName.localeCompare(b.DisplayName));if(state.profile==="preset"){state.selectedApps=new Set([...state.selectedApps].filter((name)=>state.catalog.some((app)=>appKey(app)===name)));renderAppList();}else selectProfile(state.profile);}).catch((error)=>{$("bloatware-list").innerHTML=`<p class="loading">${state.uiLanguage==="de"?"Der lokale App-Katalog konnte nicht geladen werden":"Could not load the local app catalog"} (${escapeXml(error.message)}). ${state.uiLanguage==="de"?"Starte die Anwendung mit":"Start with"} <code>python main.py</code>.</p>`;});
