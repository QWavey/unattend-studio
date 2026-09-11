"use strict";

const $ = (id) => document.getElementById(id);
const escapeXml = (value) => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"})[char]);
const state = {
  page: 0,
  completed: new Set(),
  profile: "standard",
  setupName: "",
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
  try { const value=localStorage.getItem("unattend-studio-preset-v1"); return value?JSON.parse(value):null; } catch { return null; }
}
function updatePresetChoice() {
  const exists=Boolean(savedPreset());
  $("preset-description").textContent=exists?"Open your saved Windows setup.":"No saved setup yet. Open to learn how to create one.";
  $("profile-preset").classList.toggle("has-preset",exists);
  if (!$("preset-panel").hidden) renderPresetPanel();
}
function renderPresetPanel() {
  const preset=savedPreset(), content=$("preset-content");
  if(!preset){content.innerHTML='<div class="preset-empty"><strong>No presets saved yet</strong><span>Complete a setup and choose “Save as preset” on the Output page. It will appear here on this computer.</span></div>';return;}
  const name=String(preset.setupName||profileDisplayName()).trim()||"Saved Windows setup";
  const accountCount=Array.isArray(preset.accounts)?preset.accounts.length:0;
  const appCount=Array.isArray(preset.apps)?preset.apps.length:0;
  content.innerHTML=`<article class="saved-preset-card"><div><h3>${escapeXml(name)}</h3><p>${accountCount} account${accountCount===1?"":"s"} · ${appCount} app removal${appCount===1?"":"s"} · Saved locally</p></div><div class="preset-card-actions"><button class="button danger" type="button" data-delete-preset>Delete</button><button class="button primary" type="button" data-load-preset>Use preset</button></div></article>`;
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
  if(!savedPreset()||!confirm("Delete this saved preset? This cannot be undone.")) return;
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
  state.completed = new Set([0,1,2,3,4]);
  showPage(5);
}

function renderAccounts() {
  $("accounts").innerHTML = state.accounts.map((account, index) => `
    <section class="account-row" data-account="${account.id}" style="--row-index:${index}">
      <div class="account-heading"><h2>Account ${index + 1}</h2>${state.accounts.length > 1 ? `<button type="button" class="remove-account" data-remove-account="${account.id}">Remove</button>` : ""}</div>
      <div class="field-grid">
        <label>Account name<input type="text" data-account-field="name" value="${escapeXml(account.name)}" placeholder="${index === 0 ? "Alex" : "Account name"}" autocomplete="off"></label>
        <label>Password<div class="password-control"><input type="${account.passwordVisible?"text":"password"}" data-account-field="password" value="${escapeXml(account.password)}" placeholder="Required" autocomplete="new-password"><button type="button" class="password-toggle ${account.passwordVisible?"visible":""}" data-toggle-password="${account.id}" aria-label="${account.passwordVisible?"Hide":"Show"} password"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.5"/><path class="eye-slash" d="m5 4 14 16"/></svg></button></div><small>Stored as plain text inside the XML file.</small></label>
      </div>
      <label class="admin-check"><input type="checkbox" data-account-field="isAdmin" ${account.isAdmin ? "checked" : ""}><span><strong>Is administrator</strong><small>Can install software and change system settings.</small></span></label>
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
    const detail = selectors ? `${selectors} removal rule${selectors === 1 ? "" : "s"}` : "special removal rule";
    return `<label class="app-row" style="--row-index:${Math.min(index,12)}"><input type="checkbox" data-app="${escapeXml(name)}" ${state.selectedApps.has(name)?"checked":""}><span><strong>${escapeXml(name)}</strong><small>${detail}${isCore?" · Windows component, harder to restore":""}</small></span></label>`;
  }).join("") : '<p class="loading">No apps match that search.</p>';
  updateAppCount();
}

function updateAppCount() {
  const count = state.selectedApps.size;
  $("app-count").textContent = `${count} app${count === 1 ? "" : "s"} selected`;
}

function renderAdvancedOptions() {
  $("advanced-options").innerHTML = Object.entries(advancedGroups).map(([group,options]) => {
    return `<details class="option-group"><summary>${escapeXml(group)}<span>${options.length}</span></summary><div class="option-group-body">${options.map((option) => `<div class="option-wrap"><label class="option-row"><input type="checkbox" data-advanced="${escapeXml(option)}"><span><strong>${escapeXml(option)}</strong>${advancedHelp[option]?`<small>${escapeXml(advancedHelp[option])}</small>`:""}</span></label>${option==="Custom paging file"?'<div class="inline-settings" data-for="Custom paging file"><label>Initial size<input id="pagefile-initial" type="number" min="256" max="131072" value="4096"><small>MB</small></label><label>Maximum size<input id="pagefile-maximum" type="number" min="256" max="131072" value="8192"><small>MB</small></label></div>':""}</div>`).join("")}</div></details>`;
  }).join("");
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
function perUserCommands(defaultUser=false) {
  const selected=selectedAdvanced(), root=defaultUser?"HKU":"HKCU", prefix=defaultUser?"DefaultUser\\":"", lines=[];
  const add=(name,...commands)=>{if(selected.has(name)) lines.push(...commands);};
  const userReg=(path,name,type,value)=>reg(root,`${prefix}${path}`,name,type,value);
  add("Always show file extensions",userReg("Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced","HideFileExt","REG_DWORD",0));
  add("Show hidden files",userReg("Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced","Hidden","REG_DWORD",1));
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
  const defaults=perUserCommands(true);
  if(defaults.length) lines.push("reg.exe load 'HKU\\DefaultUser' 'C:\\Users\\Default\\NTUSER.DAT'",...defaults,"reg.exe unload 'HKU\\DefaultUser'");
  if(state.selectedApps.size) lines.push(removalScript());
  lines.push("'System settings complete' | Out-File $log -Append");
  return lines.join(";\r\n");
}

function advancedUserScript() {
  const selected=selectedAdvanced(), lines=["$ErrorActionPreference = 'Continue'","$log = 'C:\\Windows\\Setup\\Scripts\\UnattendStudio-User.log'"];
  const add=(name,...commands)=>{if(selected.has(name)) lines.push(...commands);};
  lines.push(accountCaseScript());
  lines.push(...perUserCommands(false));
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
  if (computer && (!/^[A-Za-z0-9-]{1,15}$/.test(computer) || /^\d+$/.test(computer))) { alert("Use 1 to 15 letters, numbers or hyphens for the computer name. It cannot contain only numbers."); showPage(1); $("computer").focus(); return false; }
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
  if (!state.accounts.length) { showAccountError("Add at least one account, including its name and password."); return false; }
  const incomplete=state.accounts.findIndex((account)=>!account.name.trim() || !account.password);
  if (incomplete>=0) { const missing=state.accounts[incomplete].name.trim()?"password":"name"; showAccountError(`Account ${incomplete+1} needs a ${missing} before you can continue.`,incomplete,missing); return false; }
  const names=state.accounts.map((account)=>account.name.trim());
  const reserved=new Set(["administrator","defaultaccount","guest","wdagutilityaccount","con","prn","aux","nul"]);
  const invalid=names.findIndex((name)=>!/^[-_. A-Za-z0-9]{1,20}$/.test(name) || /[. ]$/.test(name) || reserved.has(name.toLowerCase()));
  if (invalid>=0) { showAccountError("Use a unique account name up to 20 characters. Reserved Windows names and names ending in a space or period are not allowed.",invalid); return false; }
  if (new Set(names.map((name)=>name.toLowerCase())).size !== names.length) { showAccountError("Each local account needs a unique name."); return false; }
  if ((state.selectedApps.size || selectedAdvanced().size) && state.accounts.length && !state.accounts.some((account)=>account.isAdmin)) { showAccountError("App removal and advanced changes need at least one administrator account."); return false; }
  return true;
}

function validateAdvanced() {
  if (!hasAdvanced("Custom paging file")) return true;
  const initial=Number($("pagefile-initial").value), maximum=Number($("pagefile-maximum").value);
  if (!Number.isInteger(initial)||!Number.isInteger(maximum)||initial<256||maximum<initial||maximum>131072) {
    alert("Paging file sizes must be whole numbers from 256 to 131072 MB, and the maximum cannot be smaller than the initial size.");
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

function profileDisplayName() { return {minimal:"Lean Windows",standard:"Clean Windows",custom:"Custom setup",preset:"Saved preset"}[state.profile]||"Custom setup"; }
function commitSetupName(input) {
  if(!input?.isConnected) return;
  state.setupName=input.value.trim().slice(0,60);
  renderReview();
}
function editSetupName() {
  const value=state.setupName||profileDisplayName(), valueCell=$("setup-name")?.parentElement;
  if(!valueCell) return;
  valueCell.innerHTML=`<label class="sr-only" for="setup-name-input">Setup name</label><input id="setup-name-input" class="setup-name-input" type="text" maxlength="60" value="${escapeXml(value)}">`;
  const input=$("setup-name-input"); input.focus(); input.select();
  input.addEventListener("blur",()=>commitSetupName(input),{once:true});
  input.addEventListener("keydown",(event)=>{if(event.key==="Enter"){event.preventDefault();commitSetupName(input);}if(event.key==="Escape"){event.preventDefault();renderReview();}});
}

function renderReview() {
  const adminCount=state.accounts.filter((account)=>account.isAdmin).length;
  const accountSummary=state.accounts.length?`${state.accounts.length} (${adminCount} administrator${adminCount===1?"":"s"})`:"Create during Windows setup";
  const setupName=state.setupName||profileDisplayName();
  const rows=[["Computer",$("computer").value.trim()||"DESKTOP-PC"],["Accounts",accountSummary],["Apps removed",String(state.selectedApps.size)],["Advanced changes",String(document.querySelectorAll("[data-advanced]:checked").length)]];
  $("review").innerHTML=`<div class="review-row"><dt>Setup style</dt><dd class="editable-value"><span id="setup-name">${escapeXml(setupName)}</span><button id="edit-setup-name" class="edit-name" type="button" aria-label="Rename setup"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15.5 5.5 3 3M5 19l3.8-.8L19 7a1.4 1.4 0 0 0 0-2l0 0a1.4 1.4 0 0 0-2 0L5.8 15.2 5 19Z"/></svg></button></dd></div>${rows.map(([term,value])=>`<div class="review-row"><dt>${escapeXml(term)}</dt><dd>${escapeXml(value)}</dd></div>`).join("")}`;
  $("preview").textContent=generatedXml();
}

function updateOutput() { if (state.page===5) renderReview(); }
function downloadXml() {
  const link=document.createElement("a"); link.href=URL.createObjectURL(new Blob([generatedXml()],{type:"application/xml"})); link.download="autounattend.xml"; link.click(); URL.revokeObjectURL(link.href);
}

document.addEventListener("click",(event)=>{
  const next=event.target.closest(".next"), back=event.target.closest(".back"), go=event.target.closest("[data-go]"), remove=event.target.closest("[data-remove-account]"), passwordToggle=event.target.closest("[data-toggle-password]"), editName=event.target.closest("#edit-setup-name");
  if (next && validateStep(state.page)) { state.completed.add(state.page); showPage(state.page+1); }
  if (back) showPage(state.page-1);
  if (go) { const target=Number(go.dataset.go); if ((target===state.page || state.completed.has(target)) && (target<=state.page || validateConfiguration())) showPage(target); }
  if (remove) { state.accounts=state.accounts.filter((account)=>account.id!==remove.dataset.removeAccount); renderAccounts(); updateOutput(); }
  if (passwordToggle) { const account=state.accounts.find((item)=>item.id===passwordToggle.dataset.togglePassword); const input=passwordToggle.parentElement.querySelector("input"); if(account&&input){account.passwordVisible=!account.passwordVisible;input.type=account.passwordVisible?"text":"password";passwordToggle.classList.toggle("visible",account.passwordVisible);passwordToggle.setAttribute("aria-label",`${account.passwordVisible?"Hide":"Show"} password`);} }
  if (editName) { event.preventDefault(); editSetupName(); }
});
document.addEventListener("input",(event)=>{
  const app=event.target.closest("[data-app]");
  if (app) { app.checked?state.selectedApps.add(app.dataset.app):state.selectedApps.delete(app.dataset.app); updateAppCount(); updateOutput(); }
  const accountField=event.target.dataset.accountField;
  if (accountField) { const row=event.target.closest("[data-account]"); const account=state.accounts.find((item)=>item.id===row.dataset.account); if (account) account[accountField]=accountField==="isAdmin"?event.target.checked:event.target.value; row.classList.remove("invalid"); $("account-error").hidden=true; updateOutput(); }
  const advanced=event.target.closest("[data-advanced]");
  if (advanced) {
    (exclusiveAdvanced[advanced.dataset.advanced]||[]).forEach((name)=>{const other=[...document.querySelectorAll("[data-advanced]")].find((input)=>input.dataset.advanced===name);if(other){other.checked=false;other.closest(".option-wrap")?.classList.remove("enabled");}});
    if(advanced.dataset.advanced==="Automatic GPT or MBR layout"&&advanced.checked){const wipe=[...document.querySelectorAll("[data-advanced]")].find((input)=>input.dataset.advanced==="Wipe and partition target disk");wipe.checked=true;wipe.closest(".option-wrap")?.classList.add("enabled");}
    if(advanced.dataset.advanced==="Wipe and partition target disk"&&!advanced.checked){const auto=[...document.querySelectorAll("[data-advanced]")].find((input)=>input.dataset.advanced==="Automatic GPT or MBR layout");auto.checked=false;auto.closest(".option-wrap")?.classList.remove("enabled");}
    advanced.closest(".option-wrap")?.classList.toggle("enabled",advanced.checked); updateOutput();
  }
});
document.querySelectorAll("input[name=profile]").forEach((input)=>input.addEventListener("change",()=>{ document.querySelectorAll("[data-preconfigured]").forEach((box)=>{box.checked=false;}); state.preconfigured=false; if(!state.accounts.length){state.accounts=[{id:crypto.randomUUID(),name:"",password:"",isAdmin:true,passwordVisible:false}];renderAccounts();} selectProfile(input.value); }));
document.querySelectorAll("[data-preconfigured]").forEach((input)=>input.addEventListener("change",()=>usePreconfiguredProfile(input.dataset.preconfigured,input.checked)));
document.querySelectorAll("[data-preset]").forEach((button)=>button.addEventListener("click",()=>applyPreset(button.dataset.preset)));
$("profile-preset").addEventListener("click",openPresetPanel);
document.querySelector("[data-close-presets]").addEventListener("click",closePresetPanel);
$("preset-content").addEventListener("click",(event)=>{if(event.target.closest("[data-load-preset]"))useSavedPreset();if(event.target.closest("[data-delete-preset]"))deleteSavedPreset();});
$("theme-toggle").addEventListener("click",()=>{const theme=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=theme;try{localStorage.setItem("unattend-studio-theme",theme);}catch{}updateThemeToggle();});
$("add-account").addEventListener("click",()=>{ if (state.accounts.length>=5) return; state.accounts.push({id:crypto.randomUUID(),name:"",password:"",isAdmin:false,passwordVisible:false}); renderAccounts(); requestAnimationFrame(()=>$("accounts").lastElementChild?.querySelector("input")?.focus()); });
$("app-search").addEventListener("input",renderAppList);
$("copy").addEventListener("click",async()=>{ await navigator.clipboard.writeText(generatedXml()); $("copy").textContent="Copied"; setTimeout(()=>{$("copy").textContent="Copy XML";},1200); });
$("save-preset").addEventListener("click",()=>{ if(!validateConfiguration()) return; try{localStorage.setItem("unattend-studio-preset-v1",JSON.stringify(capturePreset()));updatePresetChoice();$("save-preset").textContent="Preset saved";setTimeout(()=>{$("save-preset").textContent="Save as preset";},1400);}catch{alert("This browser did not allow the preset to be saved locally.");} });
$("finish").addEventListener("click",()=>{ if (validateConfiguration()) downloadXml(); });

function updateThemeToggle(){const dark=document.documentElement.dataset.theme==="dark";$("theme-toggle").setAttribute("aria-label",`Switch to ${dark?"light":"dark"} mode`);$("theme-toggle").setAttribute("aria-pressed",String(dark));$("theme-toggle").querySelector(".theme-label").textContent=dark?"Night":"Day";}

renderAccounts(); renderAdvancedOptions(); updatePresetChoice(); updateStepNavigation(); updateThemeToggle();
fetch("resource/Bloatware.json").then((response)=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json();}).then((catalog)=>{state.catalog=catalog.sort((a,b)=>a.DisplayName.localeCompare(b.DisplayName));if(state.profile==="preset"){state.selectedApps=new Set([...state.selectedApps].filter((name)=>state.catalog.some((app)=>appKey(app)===name)));renderAppList();}else selectProfile(state.profile);}).catch((error)=>{$("bloatware-list").innerHTML=`<p class="loading">Could not load the local app catalog (${escapeXml(error.message)}). Start with <code>python main.py</code>.</p>`;});
