"""Live smoke tests for the local setup wizard.

Usage: python tests/ui_smoke.py http://127.0.0.1:PORT/main.html
Requires Selenium and an installed Chrome browser.
"""
from __future__ import annotations

import sys
import time
import xml.etree.ElementTree as ET

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By


URL = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:62835/main.html"


def browser() -> webdriver.Chrome:
    options = Options()
    options.binary_location = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    return webdriver.Chrome(options=options)


def main() -> None:
    driver = browser()
    try:
        driver.get(URL)
        time.sleep(0.4)
        assert len(driver.find_elements(By.CSS_SELECTOR, "[data-advanced]")) == 42
        assert driver.find_element(By.CSS_SELECTOR, "[data-go='4']").get_attribute("disabled")

        for page in range(2):
            driver.find_elements(By.CSS_SELECTOR, ".next")[page].click()
        driver.find_element(By.CSS_SELECTOR, "[data-page='2'] .next").click()
        assert driver.find_element(By.ID, "account-error").is_displayed()

        driver.get(URL)
        driver.find_element(By.CSS_SELECTOR, "[data-preconfigured='standard']").click()
        assert driver.find_element(By.CSS_SELECTOR, ".wizard-page.active").get_attribute("data-page") == "5"
        assert driver.find_element(By.CSS_SELECTOR, "[data-account-field='name']").get_attribute("value") == "Test"
        assert driver.find_element(By.CSS_SELECTOR, "[data-account-field='password']").get_attribute("value") == "Test123?"
        assert driver.find_element(By.CSS_SELECTOR, "[data-account-field='isAdmin']").is_selected()
        assert not driver.find_elements(By.CSS_SELECTOR, "input[name='output'], #iso-workflow")

        driver.execute_script("showPage(4)")
        for name in ("Skip network page automatically", "Sign in automatically once", "Disable telemetry", "Enable Windows Sandbox"):
            driver.execute_script("const n=arguments[0],e=[...document.querySelectorAll('[data-advanced]')].find(x=>x.dataset.advanced===n);e.click()", name)
        xml = driver.execute_script("return generatedXml()")
        ET.fromstring(xml)
        for token in ("BypassNRO", "AutoLogon", "AllowTelemetry", "Containers-DisposableClientVM", "UnattendStudio-System.ps1"):
            assert token in xml, token

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
        driver.execute_script("[...document.querySelectorAll('[data-advanced]')].find(e=>e.dataset.advanced==='Skip network page automatically').click()")
        case_xml = driver.execute_script("return generatedXml()")
        assert "<Name>Admin</Name>" in case_xml and "<DisplayName>Admin</DisplayName>" in case_xml
        assert "UnattendCaseFix" in case_xml
        assert "<SkipMachineOOBE>true</SkipMachineOOBE>" in case_xml
        assert "<SkipUserOOBE>true</SkipUserOOBE>" in case_xml

        driver.execute_script("document.querySelectorAll('[data-advanced]').forEach(e=>e.checked=false);document.getElementById('network').checked=true")
        easy_skip_xml = driver.execute_script("return generatedXml()")
        assert "<SkipMachineOOBE>true</SkipMachineOOBE>" in easy_skip_xml
        assert "<AutoLogon>" in easy_skip_xml

        driver.execute_script("showPage(5)")
        driver.find_element(By.ID, "save-preset").click()
        assert not driver.find_element(By.ID, "profile-preset").get_attribute("disabled")
        assert driver.execute_script("return JSON.parse(localStorage.getItem('unattend-studio-preset-v1')).accounts[0].name") == "Admin"

        driver.refresh()
        time.sleep(0.4)
        driver.find_element(By.ID, "profile-preset").click()
        assert driver.find_element(By.CSS_SELECTOR, "[data-account-field='name']").get_attribute("value") == "Admin"
        assert driver.execute_script("return state.profile") == "preset"
        driver.execute_script("localStorage.setItem('unattend-studio-preset-v1','not-json')")
        driver.refresh()
        assert driver.find_element(By.ID, "profile-preset").get_attribute("disabled")

        severe = [entry for entry in driver.get_log("browser") if entry["level"] == "SEVERE" and "favicon.ico" not in entry["message"]]
        assert not severe, severe
        print("UI smoke test passed")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
