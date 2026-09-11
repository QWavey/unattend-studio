"""Live smoke tests for the local setup wizard.

Usage: python tests/ui_smoke.py http://127.0.0.1:PORT/main.html
Requires Selenium and an installed Chrome browser.
"""
from __future__ import annotations

import sys
import os
import subprocess
import tempfile
import time
import xml.etree.ElementTree as ET
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By


URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:62835/main.html"


def assert_powershell_parses(script: str, label: str) -> None:
    parser = "$s=[Console]::In.ReadToEnd();$t=$null;$e=$null;[System.Management.Automation.Language.Parser]::ParseInput($s,[ref]$t,[ref]$e)|Out-Null;if($e.Count){$e|ForEach-Object{$_.Message};exit 1}"
    result = subprocess.run(
        ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", parser],
        input=script,
        text=True,
        capture_output=True,
        timeout=15,
        check=False,
    )
    assert result.returncode == 0, f"{label} is not valid Windows PowerShell:\n{result.stdout}{result.stderr}"


def assert_completion_report_renders(script: str) -> None:
    test_script = script.replace("$desktop=[Environment]::GetFolderPath('Desktop')", "$desktop=$env:TEMP").replace("Start-Process -FilePath $reportPath", "Write-Output $reportPath")
    with tempfile.TemporaryDirectory(prefix="unattend-report-") as temp_dir:
        environment = os.environ.copy()
        environment["TEMP"] = temp_dir
        result = subprocess.run(
            ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", test_script],
            text=True,
            capture_output=True,
            timeout=20,
            check=False,
            env=environment,
        )
        assert result.returncode == 0, result.stdout + result.stderr
        report = Path(temp_dir) / "Completed_commands.png"
        assert report.read_bytes().startswith(b"\x89PNG\r\n\x1a\n")


def browser() -> webdriver.Chrome:
    options = Options()
    options.binary_location = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--window-size=1440,1000")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    return webdriver.Chrome(options=options)


def main() -> None:
    driver = browser()
    try:
        driver.get(URL)
        time.sleep(0.4)
        assert len(driver.find_elements(By.CSS_SELECTOR, "[data-advanced]")) == 43
        assert driver.find_element(By.CSS_SELECTOR, "[data-go='4']").get_attribute("disabled")
        assert driver.execute_script("return document.documentElement.dataset.theme") == "dark"
        theme_toggle = driver.find_element(By.ID, "theme-toggle")
        assert driver.execute_script("return getComputedStyle(arguments[0]).borderTopWidth", theme_toggle) == "0px"
        assert driver.execute_script("return getComputedStyle(document.querySelector('.theme-track i')).backgroundColor") == "rgb(255, 255, 255)"
        assert driver.find_element(By.CSS_SELECTOR, ".theme-track").rect["width"] >= 40
        figure_x = driver.find_element(By.CSS_SELECTOR, ".figure-panel").rect["x"]
        work_x = driver.find_element(By.CSS_SELECTOR, ".work-area").rect["x"]
        rail_x = driver.find_element(By.CSS_SELECTOR, ".setup-rail").rect["x"]
        assert figure_x < work_x < rail_x
        driver.find_element(By.ID, "theme-toggle").click()
        time.sleep(0.25)
        assert driver.execute_script("return document.documentElement.dataset.theme") == "light"
        assert driver.execute_script("return localStorage.getItem('unattend-studio-theme')") == "light"
        assert driver.execute_script("return getComputedStyle(document.querySelector('.theme-track i')).backgroundColor") == "rgb(0, 0, 0)"
        driver.find_element(By.ID, "theme-toggle").click()
        time.sleep(0.25)
        assert driver.execute_script("return document.documentElement.dataset.theme") == "dark"

        driver.find_element(By.ID, "language-toggle").click()
        assert driver.execute_script("return document.documentElement.lang") == "de"
        assert driver.execute_script("return localStorage.getItem('unattend-studio-language')") == "de"
        assert driver.find_element(By.CSS_SELECTOR, "[data-page='0'] h1").text == "Wähle dein Setup"
        assert "Erweitert" in driver.find_element(By.CSS_SELECTOR, "[data-go='4']").text
        assert driver.find_element(By.CSS_SELECTOR, "[data-advanced-preset='recommended']").get_attribute("textContent") == "Empfohlen"

        driver.execute_script("showPage(4)")
        preset_counts = {"recommended": 12, "privacy": 7, "developer": 8, "virtual-machine": 7, "none": 0}
        for preset, expected in preset_counts.items():
            driver.find_element(By.CSS_SELECTOR, f"[data-advanced-preset='{preset}']").click()
            assert len(driver.find_elements(By.CSS_SELECTOR, "[data-advanced]:checked")) == expected
            assert "active" in driver.find_element(By.CSS_SELECTOR, f"[data-advanced-preset='{preset}']").get_attribute("class").split()
        driver.find_element(By.CSS_SELECTOR, "[data-advanced-preset='privacy']").click()
        driver.find_element(By.ID, "language-toggle").click()
        assert driver.execute_script("return document.documentElement.lang") == "en"
        assert driver.find_element(By.CSS_SELECTOR, "[data-advanced='Disable telemetry']").is_selected()
        assert driver.find_element(By.CSS_SELECTOR, "[data-advanced='Disable telemetry']").find_element(By.XPATH, "following-sibling::span/strong").get_attribute("textContent") == "Disable telemetry"
        driver.find_element(By.CSS_SELECTOR, "[data-advanced-preset='none']").click()
        driver.execute_script("showPage(0)")
        first_step = driver.find_element(By.CSS_SELECTOR, "[data-go='0']")
        first_step.click()
        assert driver.execute_script("return getComputedStyle(arguments[0]).outlineStyle", first_step) == "none"

        driver.find_element(By.ID, "profile-preset").click()
        time.sleep(0.25)
        assert driver.find_element(By.ID, "preset-panel").is_displayed()
        assert driver.find_element(By.CSS_SELECTOR, ".preset-empty").is_displayed()
        driver.find_element(By.CSS_SELECTOR, "[data-close-presets]").click()
        assert driver.find_element(By.ID, "profile-list").is_displayed()

        for page in range(2):
            driver.find_elements(By.CSS_SELECTOR, ".next")[page].click()
        driver.find_element(By.CSS_SELECTOR, "[data-page='2'] .next").click()
        assert driver.find_element(By.ID, "account-error").is_displayed()

        driver.get(URL)
        driver.find_element(By.CSS_SELECTOR, "[data-preconfigured='standard']").click()
        assert driver.find_element(By.CSS_SELECTOR, ".wizard-page.active").get_attribute("data-page") == "0"
        assert driver.find_element(By.CSS_SELECTOR, "[data-go='5']").get_attribute("disabled")
        driver.find_element(By.CSS_SELECTOR, "[data-page='0'] .next").click()
        assert driver.find_element(By.CSS_SELECTOR, ".wizard-page.active").get_attribute("data-page") == "5"
        assert driver.find_element(By.CSS_SELECTOR, "[data-account-field='name']").get_attribute("value") == "Test"
        assert driver.find_element(By.CSS_SELECTOR, "[data-account-field='password']").get_attribute("value") == "Test123?"
        assert driver.find_element(By.CSS_SELECTOR, "[data-account-field='isAdmin']").is_selected()
        assert not driver.find_elements(By.CSS_SELECTOR, "input[name='output'], #iso-workflow")

        driver.find_element(By.CSS_SELECTOR, "[data-go='2']").click()
        password = driver.find_element(By.CSS_SELECTOR, "[data-account-field='password']")
        reveal = driver.find_element(By.CSS_SELECTOR, "[data-toggle-password]")
        assert password.get_attribute("type") == "password"
        reveal.click()
        assert password.get_attribute("type") == "text"
        assert reveal.get_attribute("aria-label") == "Hide password"

        driver.find_element(By.CSS_SELECTOR, "[data-go='5']").click()
        driver.find_element(By.CSS_SELECTOR, "[data-page='5'] .back").click()
        output_step = driver.find_element(By.CSS_SELECTOR, "#steps li:nth-child(6)")
        assert "returnable" in output_step.get_attribute("class").split()
        assert not driver.find_element(By.CSS_SELECTOR, "[data-go='5']").get_attribute("disabled")
        driver.find_element(By.CSS_SELECTOR, "[data-go='5']").click()
        assert driver.find_element(By.CSS_SELECTOR, ".wizard-page.active").get_attribute("data-page") == "5"

        driver.find_element(By.ID, "edit-setup-name").click()
        setup_name = driver.find_element(By.ID, "setup-name-input")
        setup_name.send_keys("Office image")
        driver.execute_script("document.activeElement.blur()")
        assert driver.find_element(By.ID, "setup-name").text == "Office image"

        driver.execute_script("showPage(4)")
        for name in ("Skip network page automatically", "Sign in automatically once", "Disable telemetry", "Enable Windows Sandbox"):
            driver.execute_script("const n=arguments[0],e=[...document.querySelectorAll('[data-advanced]')].find(x=>x.dataset.advanced===n);e.click()", name)
        xml = driver.execute_script("return generatedXml()")
        ET.fromstring(xml)
        for token in ("BypassNRO", "AutoLogon", "AllowTelemetry", "Containers-DisposableClientVM", "UnattendStudio-System.ps1"):
            assert token in xml, token

        driver.execute_script("document.querySelectorAll('[data-advanced]').forEach(e=>e.checked=false)")
        for name in ("Always show file extensions", "Show hidden files"):
            driver.execute_script("const n=arguments[0],e=[...document.querySelectorAll('[data-advanced]')].find(x=>x.dataset.advanced===n);e.click()", name)
        explorer_xml = driver.execute_script("return generatedXml()")
        assert "Set-UnattendExplorerPreferences" in explorer_xml
        assert "New-ItemProperty" in explorer_xml
        assert "HideFileExt" in explorer_xml and "Hidden" in explorer_xml
        assert "Registry::HKEY_USERS\\DefaultUser" in explorer_xml
        assert "Registry::HKEY_CURRENT_USER" in explorer_xml
        assert "$attempt -lt 5" in explorer_xml

        driver.execute_script("document.querySelectorAll('[data-advanced]').forEach(e=>e.checked=false);[...document.querySelectorAll('[data-advanced]')].find(e=>e.dataset.advanced==='Enable Developer Mode').click()")
        developer_xml = driver.execute_script("return generatedXml()")
        assert "AppModelUnlock" in developer_xml
        assert "AllowDevelopmentWithoutDevLicense" in developer_xml
        assert "wmic.exe" not in developer_xml.lower() and " wmic " not in developer_xml.lower()

        driver.execute_script("document.getElementById('command-report').click()")
        report_xml = driver.execute_script("return generatedXml()")
        for token in ("Completed_commands.png", "System.Drawing", "Start-Process -FilePath $reportPath", "UnattendStudio-System-results.json"):
            assert token in report_xml, token
        lowered_report_xml = report_xml.lower()
        for forbidden in ("wmic.exe", " get-wmiobject", "get-ciminstance", "win32_computersystem", "win32_pagefilesetting"):
            assert forbidden not in lowered_report_xml, forbidden

        driver.execute_script("document.querySelectorAll('[data-advanced]').forEach(e=>e.checked=true)")
        scripts = driver.execute_script("return [advancedSystemScript(), advancedUserScript(), removalScript(), accountCaseScript()]")
        combined_scripts = "\n".join(scripts).lower()
        for forbidden in ("wmic.exe", " get-wmiobject", "get-ciminstance", "win32_computersystem", "win32_pagefilesetting"):
            assert forbidden not in combined_scripts, forbidden
        for label, script in zip(("system script", "user script", "app-removal script", "account-name script"), scripts):
            assert_powershell_parses(script, label)
        assert_completion_report_renders(driver.execute_script("return completionReportScript()"))

        driver.execute_script("document.querySelectorAll('[data-advanced]').forEach(e=>e.checked=false);document.getElementById('network').checked=false")
        baseline = driver.execute_script("return generatedXml()")
        unchanged = []
        for control in driver.find_elements(By.CSS_SELECTOR, "[data-advanced]"):
            name = control.get_attribute("data-advanced")
            driver.execute_script("document.querySelectorAll('[data-advanced]').forEach(e=>e.checked=false);arguments[0].click()", control)
            candidate = driver.execute_script("return generatedXml()")
            try:
                ET.fromstring(candidate)
            except ET.ParseError as error:
                raise AssertionError(f"{name} generated invalid XML: {error}") from error
            if candidate == baseline:
                unchanged.append(name)
        assert not unchanged, f"Advanced controls without output behavior: {unchanged}"

        def advanced(name: str):
            return driver.find_element(By.CSS_SELECTOR, f"[data-advanced='{name}']")

        def toggle(name: str) -> None:
            driver.execute_script("arguments[0].click()", advanced(name))

        driver.execute_script("document.querySelectorAll('[data-advanced]').forEach(e=>e.checked=false)")
        toggle("Custom paging file")
        toggle("No paging file")
        assert not advanced("Custom paging file").is_selected()
        toggle("Automatic GPT or MBR layout")
        assert advanced("Wipe and partition target disk").is_selected()
        toggle("Wipe and partition target disk")
        assert not advanced("Automatic GPT or MBR layout").is_selected()

        driver.execute_script("state.accounts[0].password=arguments[0];renderAccounts()", "A<&\"'z")
        ET.fromstring(driver.execute_script("return generatedXml()"))

        driver.execute_script("state.accounts[0].name='Admin';state.accounts[0].password='Test123?';renderAccounts();document.querySelectorAll('[data-advanced]').forEach(e=>e.checked=false)")
        driver.execute_script("document.getElementById('computer').value='Admin';window.alert=()=>{}")
        assert driver.execute_script("return validateConfiguration()") is False
        driver.execute_script("document.getElementById('computer').value='';showPage(4)")
        driver.execute_script("[...document.querySelectorAll('[data-advanced]')].find(e=>e.dataset.advanced==='Skip network page automatically').click()")
        case_xml = driver.execute_script("return generatedXml()")
        assert "<Name>Admin</Name>" in case_xml and "<DisplayName>Admin</DisplayName>" in case_xml
        assert "UnattendCaseFix" in case_xml
        assert "SkipMachineOOBE" not in case_xml and "SkipUserOOBE" not in case_xml
        case_root = ET.fromstring(case_xml)
        ns = {"u": "urn:schemas-microsoft-com:unattend"}
        specialize_shell = case_root.find("./u:settings[@pass='specialize']/u:component[@name='Microsoft-Windows-Shell-Setup']", ns)
        oobe_shell = case_root.find("./u:settings[@pass='oobeSystem']/u:component[@name='Microsoft-Windows-Shell-Setup']", ns)
        assert specialize_shell is not None and specialize_shell.find("u:ComputerName", ns).text == "DESKTOP-PC"
        assert oobe_shell is not None and oobe_shell.find("u:ComputerName", ns) is None
        local_account = oobe_shell.find("u:UserAccounts/u:LocalAccounts/u:LocalAccount", ns)
        assert [child.tag.rsplit("}", 1)[-1] for child in local_account] == ["Name", "DisplayName", "Group", "Password"]
        auto_logon = oobe_shell.find("u:AutoLogon", ns)
        assert [child.tag.rsplit("}", 1)[-1] for child in auto_logon] == ["Username", "Enabled", "LogonCount", "Password"]
        assert "NoLocalPasswordResetQuestions" in case_xml
        assert "Remove-LocalUser" in case_xml
        assert "\\_" not in case_xml

        driver.execute_script("applyPreset('xbox')")
        xbox_xml = driver.execute_script("return generatedXml()")
        assert "Final app-removal pass" in xbox_xml
        assert xbox_xml.count("Microsoft.GamingApp") >= 2
        driver.execute_script("state.selectedApps.clear();renderAppList()")

        driver.execute_script("document.querySelectorAll('[data-advanced]').forEach(e=>e.checked=false);document.getElementById('network').checked=true")
        easy_skip_xml = driver.execute_script("return generatedXml()")
        assert "<HideWirelessSetupInOOBE>true</HideWirelessSetupInOOBE>" in easy_skip_xml
        assert "SkipMachineOOBE" not in easy_skip_xml
        assert "<AutoLogon>" in easy_skip_xml

        driver.execute_script("showPage(5)")
        driver.find_element(By.ID, "save-preset").click()
        assert "has-preset" in driver.find_element(By.ID, "profile-preset").get_attribute("class").split()
        assert driver.execute_script("return JSON.parse(localStorage.getItem('unattend-studio-preset-v1')).accounts[0].name") == "Admin"
        assert driver.execute_script("return JSON.parse(localStorage.getItem('unattend-studio-preset-v1')).setupName") == "Office image"
        assert driver.execute_script("return JSON.parse(localStorage.getItem('unattend-studio-preset-v1')).commandReport") is True

        driver.refresh()
        time.sleep(0.4)
        driver.find_element(By.ID, "profile-preset").click()
        time.sleep(0.25)
        assert driver.find_element(By.ID, "preset-panel").is_displayed()
        assert driver.find_element(By.CSS_SELECTOR, ".saved-preset-card h3").text == "Office image"
        driver.find_element(By.CSS_SELECTOR, "[data-load-preset]").click()
        assert driver.find_element(By.CSS_SELECTOR, "[data-account-field='name']").get_attribute("value") == "Admin"
        assert driver.find_element(By.ID, "command-report").is_selected()
        assert driver.execute_script("return state.profile") == "preset"
        assert driver.execute_script("return state.setupName") == "Office image"

        driver.execute_script("window.__revoked=[];window.__originalRevoke=URL.revokeObjectURL;URL.revokeObjectURL=(url)=>window.__revoked.push(url);downloadXml()")
        assert driver.execute_script("return window.__revoked.length") == 0
        time.sleep(1.1)
        assert driver.execute_script("URL.revokeObjectURL=window.__originalRevoke;return window.__revoked.length") == 1

        driver.execute_script("showPage(0)")
        driver.find_element(By.ID, "profile-preset").click()
        time.sleep(0.25)
        assert driver.find_element(By.CSS_SELECTOR, "[data-delete-preset]").is_displayed()
        driver.execute_script("window.confirm=()=>true")
        driver.find_element(By.CSS_SELECTOR, "[data-delete-preset]").click()
        assert driver.execute_script("return localStorage.getItem('unattend-studio-preset-v1')") is None
        assert driver.find_element(By.CSS_SELECTOR, ".preset-empty").is_displayed()
        assert driver.find_element(By.ID, "profile-custom").is_selected()

        driver.execute_script("localStorage.setItem('unattend-studio-preset-v1', JSON.stringify({version:1,accounts:{name:'broken'},apps:{},advanced:'all'}))")
        driver.refresh()
        time.sleep(0.25)
        assert "has-preset" not in driver.find_element(By.ID, "profile-preset").get_attribute("class").split()
        driver.execute_script("document.getElementById('profile-preset').click()")
        time.sleep(0.1)
        assert driver.find_element(By.CSS_SELECTOR, ".preset-empty").is_displayed()

        driver.execute_script("localStorage.setItem('unattend-studio-preset-v1','not-json')")
        driver.refresh()
        time.sleep(0.25)
        driver.execute_script("document.getElementById('profile-preset').click()")
        time.sleep(0.25)
        assert driver.find_element(By.CSS_SELECTOR, ".preset-empty").is_displayed()

        severe = [entry for entry in driver.get_log("browser") if entry["level"] == "SEVERE" and "favicon.ico" not in entry["message"]]
        assert not severe, severe
        print("UI smoke test passed")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
