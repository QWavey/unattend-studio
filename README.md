# Unattend Studio

Unattend Studio is a simplified, local interface for creating Windows `autounattend.xml` files. It turns the original configuration library into a six-step setup wizard that runs in a browser on your PC.

This project is based on [Christoph Schneegans' Unattend Generator](https://github.com/cschneegans/unattend-generator). His [web generator](https://schneegans.de/windows/unattend-generator/) and .NET implementation are the foundation for the Windows setup behavior, resource catalog, and advanced options retained here. This repository is an independent interface and is not an official release by the original developer.

## Run it

Windows and Python 3.10 or newer are recommended.

```powershell
python main.py
```

The launcher starts a server bound to `127.0.0.1`, opens `main.html`, and keeps all configuration data on the computer. Stop it with `Ctrl+C` in the terminal.

## What is simplified

The interface is organized around six decisions: setup style, Windows basics, accounts, app removal, advanced settings, and download. Clean and Lean configurations provide sensible starting points, while Custom starts without removal choices.

The wizard adds a few conveniences around the original generator:

- Up to five local accounts, with administrator access set separately for each account
- Clean and Lean preconfigured paths for quick XML generation
- App removal sourced from the bundled `resource/Bloatware.json` catalog
- Xbox, OneDrive, AppX package, capability, and optional-feature removal
- Setup, disk, recovery, privacy, desktop, system, paging, and virtual-machine settings
- A complete OOBE bypass that can continue directly to the configured desktop
- Browser-local presets for reusing a configuration
- A single download containing the generated `autounattend.xml`

The preconfigured Clean and Lean paths create an administrator account named `Test` with the password `Test123?`. Change those credentials before using the file on a real computer.

## Presets and passwords

Windows answer files contain local-account passwords in readable form. Saved presets also contain those passwords in browser storage. Use the wizard only on a trusted computer, delete the XML after installation, and do not commit generated answer files containing real credentials.

## Advanced settings

Advanced settings are implemented locally in the generated XML and embedded PowerShell scripts. The scripts are extracted by Windows Setup, avoiding command-line length limits when large app-removal lists are selected.

Some choices are intentionally destructive. Disk wiping targets disk 0. Disabling Defender, SmartScreen, recovery, paging, or Windows security features can reduce protection or reliability. Review the generated XML and disconnect drives that Windows Setup must not modify.

VirtualBox, VMware, VirtIO, and Parallels installation options expect the matching tools ISO to be attached to the virtual machine during first sign-in.

## Development check

With Chrome and Selenium installed, start the launcher and run:

```powershell
python tests/ui_smoke.py http://127.0.0.1:PORT/main.html
```

The smoke test covers navigation, account validation, presets, all advanced controls, XML parsing, exact account-name casing, and OOBE skipping.

## Original library and license

The original .NET source remains in this repository for compatibility and reference. See `Example.cs` for its programmatic API.

The project retains the original [MIT license](LICENSE.txt) and copyright notice for Christoph Schneegans.
