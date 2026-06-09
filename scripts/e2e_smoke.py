#!/usr/bin/env python3
"""End-to-end smoke test for the static ETF mapping dashboard."""

from __future__ import annotations

import json
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SNAPSHOT = ROOT / "data" / "latest.json"
REQUIRED_FILES = [
    "index.html",
    "src/app.js",
    "src/styles.css",
    "src/data.js",
    "data/latest.json",
]
GA_MEASUREMENT_ID = "G-B4PWH30B3G"


def run_snapshot() -> None:
    subprocess.run(
        [sys.executable, "scripts/generate_snapshot.py", "--skip-us", "--skip-cn"],
        cwd=ROOT,
        check=True,
    )


def assert_snapshot_schema() -> None:
    data = json.loads(SNAPSHOT.read_text(encoding="utf-8"))
    assert data.get("themes"), "themes[] is empty"
    required_theme = {"id", "name", "signal", "confidence", "lead", "tags", "us", "cn"}
    required_us = {"primary", "etfs", "returns", "ema", "rel", "strength"}
    required_cn = {"code", "name", "index", "returns", "amount", "mappingScore", "status", "reasons"}
    valid_signals = {"共振", "传导", "背离"}

    for theme in data["themes"]:
        missing = required_theme - theme.keys()
        assert not missing, f"{theme.get('id', '<unknown>')} missing theme fields: {sorted(missing)}"
        assert theme["signal"] in valid_signals, f"invalid signal: {theme['signal']}"
        assert required_us <= theme["us"].keys(), f"{theme['id']} missing us fields"
        assert {"ema5", "ema20", "ema60", "ema120", "emaYtd"} <= theme["us"]["ema"].keys(), (
            f"{theme['id']} missing EMA strength inputs"
        )
        assert {"short", "mid", "long", "all"} <= theme["us"]["strength"].keys(), f"{theme['id']} missing strength keys"
        assert theme["cn"], f"{theme['id']} has no A-share ETF candidates"
        for item in theme["cn"]:
            missing_cn = required_cn - item.keys()
            assert not missing_cn, f"{theme['id']}:{item.get('code', '<unknown>')} missing cn fields: {sorted(missing_cn)}"
            assert item["status"] in valid_signals, f"invalid candidate status: {item['status']}"


def assert_static_server() -> None:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]

    proc = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    try:
        base = f"http://127.0.0.1:{port}"
        deadline = time.time() + 5
        last_error: Exception | None = None
        while time.time() < deadline:
            try:
                for path in REQUIRED_FILES:
                    with urllib.request.urlopen(f"{base}/{path}", timeout=2) as response:
                        body = response.read().decode("utf-8", errors="replace")
                    assert response.status == 200, f"{path} returned {response.status}"
                    assert body.strip(), f"{path} returned empty body"
                break
            except Exception as exc:  # pragma: no cover - diagnostic loop
                last_error = exc
                time.sleep(0.2)
        else:
            raise AssertionError(f"static server check failed: {last_error}") from last_error
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()


def assert_ga_tracking_config() -> None:
    index_html = (ROOT / "index.html").read_text(encoding="utf-8")
    app_js = (ROOT / "src" / "app.js").read_text(encoding="utf-8")

    assert f"https://www.googletagmanager.com/gtag/js?id={GA_MEASUREMENT_ID}" in index_html
    assert "function gtag(){dataLayer.push(arguments);}" in index_html
    assert f"gtag('config', '{GA_MEASUREMENT_ID}')" in index_html
    assert "function trackEvent" in app_js

    for event_name in [
        "theme_select",
        "horizon_change",
        "signal_filter",
        "search",
        "page_tab_change",
        "sort_change",
        "reset_view",
        "panel_toggle",
    ]:
        assert event_name in app_js, f"missing GA event: {event_name}"


def main() -> None:
    run_snapshot()
    assert_snapshot_schema()
    assert_static_server()
    assert_ga_tracking_config()
    print("OK: end-to-end smoke test passed")


if __name__ == "__main__":
    main()
