"""Launch the local Unattend Studio UI and optional ISO build service."""

from __future__ import annotations

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse
import glob
import json
import os
import re
import shutil
import subprocess
import sys
import threading
import uuid
import webbrowser
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent
WORK_ROOT = ROOT / ".unattend-work"
JOBS: dict[str, dict] = {}
JOBS_LOCK = threading.Lock()
MAX_ISO_BYTES = 16 * 1024**3


class StudioServer(ThreadingHTTPServer):
    daemon_threads = True

    def handle_error(self, request, client_address) -> None:
        if isinstance(sys.exc_info()[1], (BrokenPipeError, ConnectionResetError)):
            return
        super().handle_error(request, client_address)


def find_tool(*names: str) -> str | None:
    for name in names:
        if path := shutil.which(name):
            return path
    return None


def find_oscdimg() -> str | None:
    if path := find_tool("oscdimg.exe", "oscdimg"):
        return path
    patterns = [
        r"C:\Program Files (x86)\Windows Kits\10\Assessment and Deployment Kit\Deployment Tools\**\Oscdimg\oscdimg.exe",
        r"C:\Program Files\Windows Kits\10\Assessment and Deployment Kit\Deployment Tools\**\Oscdimg\oscdimg.exe",
    ]
    for pattern in patterns:
        matches = glob.glob(pattern, recursive=True)
        if matches:
            return matches[0]
    return None


def capabilities() -> dict:
    extractor = find_tool("7z.exe", "7z", "7zz.exe", "7zz")
    builder = find_oscdimg()
    supported = bool(builder and (extractor or os.name == "nt"))
    if supported:
        reason = ""
    elif not builder:
        reason = "Install the Windows ADK Deployment Tools to build bootable ISO files (oscdimg.exe is missing)."
    else:
        reason = "No ISO extraction method is available. Install 7-Zip."
    return {"supported": supported, "extractor": extractor, "builder": builder, "reason": reason}


def safe_job(job_id: str) -> dict | None:
    try:
        normalized = str(uuid.UUID(job_id))
    except (ValueError, AttributeError):
        return None
    with JOBS_LOCK:
        job = JOBS.get(normalized)
        if not job:
            return None
        snapshot = job.copy()
        snapshot["log"] = list(job.get("log", []))
        return snapshot


def claim_job_for_build(job_id: str) -> bool:
    """Atomically reserve an uploaded ISO so only one builder can use it."""
    with JOBS_LOCK:
        job = JOBS.get(job_id)
        if not job or job.get("status") != "uploaded":
            return False
        job.update(status="building", phase="queued", message="Starting ISO build", progress=21)
        return True


def validate_unattend_xml(xml: str) -> str:
    """Reject malformed or unrelated XML before writing it into a Windows ISO."""
    if not isinstance(xml, str) or not xml.lstrip().startswith("<?xml") or "<!DOCTYPE" in xml.upper():
        raise ValueError("The generated answer file is invalid.")
    try:
        root = ET.fromstring(xml)
    except ET.ParseError as error:
        raise ValueError(f"The generated answer file is invalid: {error}.") from error
    if root.tag != "{urn:schemas-microsoft-com:unattend}unattend":
        raise ValueError("The generated answer file does not use the Windows unattended-setup format.")
    return xml


def update_job(job_id: str, **values) -> None:
    with JOBS_LOCK:
        job = JOBS.get(job_id)
        if not job:
            return
        if line := values.pop("log_line", None):
            job["log"].append(str(line))
            job["log"] = job["log"][-200:]
        job.update(values)


def ps_quote(path: Path) -> str:
    return "'" + str(path).replace("'", "''") + "'"


def run_process(job_id: str, command: list[str], start: int, end: int) -> None:
    process = subprocess.Popen(
        command,
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        errors="replace",
        creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0,
    )
    assert process.stdout is not None
    for raw_line in process.stdout:
        line = raw_line.strip()
        if not line:
            continue
        update_job(job_id, log_line=line)
        if match := re.search(r"(?:^|\s)(\d{1,3})%", line):
            percent = max(0, min(100, int(match.group(1))))
            update_job(job_id, progress=start + round((end - start) * percent / 100))
    return_code = process.wait()
    if return_code:
        raise RuntimeError(f"{Path(command[0]).name} stopped with exit code {return_code}.")


def extract_iso(job_id: str, iso_path: Path, source_dir: Path, extractor: str | None) -> None:
    update_job(job_id, phase="extract", message="Unpacking Windows files", progress=23, log_line="Unpacking the source ISO")
    source_dir.mkdir(parents=True, exist_ok=False)
    if extractor:
        run_process(job_id, [extractor, "x", "-y", "-bsp1", f"-o{source_dir}", str(iso_path)], 23, 58)
        return
    script = (
        "$ErrorActionPreference='Stop';"
        f"$image=Mount-DiskImage -ImagePath {ps_quote(iso_path)} -PassThru;"
        "try {$volume=$image|Get-Volume;$drive=$volume.DriveLetter+':\\';"
        f"robocopy.exe $drive {ps_quote(source_dir)} /E /COPY:DAT /DCOPY:DAT /R:1 /W:1 /NFL /NDL /NJH /NJS;"
        "if($LASTEXITCODE -gt 7){exit $LASTEXITCODE}}finally{Dismount-DiskImage -ImagePath "
        f"{ps_quote(iso_path)}}}"
    )
    update_job(job_id, progress=30, log_line="Mounting the ISO with Windows")
    run_process(job_id, ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", script], 30, 58)


def build_iso(job_id: str, xml: str) -> None:
    job = safe_job(job_id)
    if not job:
        return
    job_dir = Path(job["job_dir"])
    iso_path = Path(job["iso_path"])
    source_dir = job_dir / "source"
    output_path = job_dir / "Windows-Custom.iso"
    tools = capabilities()
    try:
        if not tools["supported"]:
            raise RuntimeError(tools["reason"])
        extract_iso(job_id, iso_path, source_dir, tools["extractor"])
        update_job(job_id, phase="customize", message="Adding your answer file", progress=62, log_line="Writing autounattend.xml")
        (source_dir / "autounattend.xml").write_text(xml, encoding="utf-8", newline="\r\n")
        bios_boot = source_dir / "boot" / "etfsboot.com"
        uefi_boot = source_dir / "efi" / "microsoft" / "boot" / "efisys.bin"
        if not bios_boot.is_file() or not uefi_boot.is_file():
            raise RuntimeError("The selected ISO does not contain standard Windows BIOS and UEFI boot files.")
        boot_data = f"2#p0,e,b{bios_boot}#pEF,e,b{uefi_boot}"
        update_job(job_id, phase="build", message="Building bootable ISO", progress=66, log_line="Building the final BIOS/UEFI bootable ISO")
        command = [tools["builder"], "-m", "-o", "-u2", "-udfver102", "-lCUSTOM_WINDOWS", f"-bootdata:{boot_data}", str(source_dir), str(output_path)]
        run_process(job_id, command, 66, 98)
        if not output_path.is_file() or output_path.stat().st_size < 1024 * 1024:
            raise RuntimeError("The ISO builder did not create a valid output file.")
        update_job(job_id, status="done", phase="done", message="ISO ready to download", progress=100, output_path=str(output_path), log_line="Finished ISO is ready")
    except Exception as error:
        update_job(job_id, status="error", phase="error", message="ISO build failed", error=str(error), log_line=f"Error: {error}")


class StudioHandler(SimpleHTTPRequestHandler):
    server_version = "UnattendStudio/1.0"

    def log_message(self, *_args) -> None:
        pass

    def send_json(self, value: dict, status: int = 200) -> None:
        body = json.dumps(value).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_error_text(self, status: int, message: str) -> None:
        body = message.encode("utf-8", errors="replace")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/capabilities":
            self.send_json(capabilities())
            return
        if parsed.path.startswith("/api/jobs/"):
            job = safe_job(unquote(parsed.path.removeprefix("/api/jobs/")))
            if not job:
                self.send_error_text(404, "Unknown ISO job.")
                return
            public = {key: value for key, value in job.items() if key not in {"job_dir", "iso_path", "output_path"}}
            self.send_json(public)
            return
        if parsed.path.startswith("/api/download/"):
            job = safe_job(unquote(parsed.path.removeprefix("/api/download/")))
            output = Path(job.get("output_path", "")) if job else None
            if not job or job.get("status") != "done" or not output or not output.is_file():
                self.send_error_text(404, "The finished ISO is not available.")
                return
            self.send_response(200)
            self.send_header("Content-Type", "application/x-iso9660-image")
            self.send_header("Content-Disposition", 'attachment; filename="Windows-Custom.iso"')
            self.send_header("Content-Length", str(output.stat().st_size))
            self.end_headers()
            with output.open("rb") as source:
                shutil.copyfileobj(source, self.wfile, length=1024 * 1024)
            return
        if parsed.path.startswith(("/.unattend-work", "/.git", "/__pycache__")):
            self.send_error_text(404, "Not found.")
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/iso":
            self.receive_iso(parsed)
            return
        if parsed.path == "/api/build":
            self.start_build()
            return
        self.send_error_text(404, "Unknown endpoint.")

    def receive_iso(self, parsed) -> None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_ISO_BYTES:
            self.send_error_text(413, "Select an ISO between 1 byte and 16 GB.")
            return
        name = Path(parse_qs(parsed.query).get("name", [""])[0]).name
        if not name.lower().endswith(".iso"):
            self.send_error_text(400, "The selected file must use the .iso extension.")
            return
        WORK_ROOT.mkdir(exist_ok=True)
        free = shutil.disk_usage(WORK_ROOT).free
        if free < length * 3:
            self.send_error_text(507, f"Not enough free space. ISO processing needs about {length * 3 / 1024**3:.1f} GB free.")
            return
        job_id = str(uuid.uuid4())
        job_dir = (WORK_ROOT / job_id).resolve()
        if job_dir.parent != WORK_ROOT.resolve():
            self.send_error_text(400, "Invalid job path.")
            return
        job_dir.mkdir()
        iso_path = job_dir / "source.iso"
        remaining = length
        try:
            with iso_path.open("xb") as output:
                while remaining:
                    chunk = self.rfile.read(min(1024 * 1024, remaining))
                    if not chunk:
                        raise ConnectionError("Upload ended before the complete ISO was received.")
                    output.write(chunk)
                    remaining -= len(chunk)
        except Exception as error:
            iso_path.unlink(missing_ok=True)
            try:
                job_dir.rmdir()
            except OSError:
                pass
            self.send_error_text(400, str(error))
            return
        with JOBS_LOCK:
            JOBS[job_id] = {"job_id": job_id, "status": "uploaded", "phase": "upload", "message": "ISO uploaded", "progress": 20, "log": [f"Received {name} ({length / 1024**3:.2f} GB)"], "job_dir": str(job_dir), "iso_path": str(iso_path)}
        self.send_json({"job_id": job_id})

    def start_build(self) -> None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 4 * 1024 * 1024:
                raise ValueError("Invalid request size.")
            payload = json.loads(self.rfile.read(length))
            job_id = str(uuid.UUID(payload.get("job_id", "")))
            xml = validate_unattend_xml(payload.get("xml", ""))
            if not claim_job_for_build(job_id):
                raise ValueError("The ISO upload is missing or has already been used.")
        except (ValueError, json.JSONDecodeError) as error:
            self.send_error_text(400, str(error))
            return
        threading.Thread(target=build_iso, args=(job_id, xml), daemon=True, name=f"iso-{job_id[:8]}").start()
        self.send_json({"job_id": job_id, "status": "building"}, 202)


def main() -> None:
    os.chdir(ROOT)
    server = StudioServer(("127.0.0.1", 0), StudioHandler)
    url = f"http://127.0.0.1:{server.server_port}/main.html"
    if "--no-browser" not in sys.argv:
        threading.Timer(0.25, lambda: webbrowser.open(url)).start()
    print(f"Unattend Studio is running at {url}. Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
