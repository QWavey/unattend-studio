"""Focused regression checks for the local ISO service."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import main


def run() -> None:
    job_id = "11111111-1111-1111-1111-111111111111"
    with main.JOBS_LOCK:
        main.JOBS.clear()
        main.JOBS[job_id] = {"job_id": job_id, "status": "uploaded", "log": ["ready"]}

    snapshot = main.safe_job(job_id)
    assert snapshot is not None
    snapshot["status"] = "tampered"
    snapshot["log"].append("changed")
    assert main.JOBS[job_id]["status"] == "uploaded"
    assert main.JOBS[job_id]["log"] == ["ready"]

    assert main.claim_job_for_build(job_id)
    assert not main.claim_job_for_build(job_id)
    assert main.JOBS[job_id]["status"] == "building"

    valid = '<?xml version="1.0"?><unattend xmlns="urn:schemas-microsoft-com:unattend"></unattend>'
    assert main.validate_unattend_xml(valid) == valid
    for invalid in ("<unattend>", "<?xml version='1.0'?><other/>", "not xml"):
        try:
            main.validate_unattend_xml(invalid)
        except ValueError:
            pass
        else:
            raise AssertionError(f"Invalid answer file was accepted: {invalid!r}")

    print("Server smoke test passed")


if __name__ == "__main__":
    run()
