"""Post-deploy API smoke test. Usage:

  python scripts/verify_api.py
  python scripts/verify_api.py --base-url https://your-api.onrender.com
"""

from __future__ import annotations

import argparse
import json
import sys
import time

import httpx

DEFAULT_BASE = "http://127.0.0.1:8000"
TIMEOUT = 45.0


def check(name: str, ok: bool, detail: str = "") -> bool:
    status = "PASS" if ok else "FAIL"
    line = f"[{status}] {name}"
    if detail:
        line += f" - {detail}"
    print(line)
    return ok


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify wjeon Dashboard API endpoints")
    parser.add_argument("--base-url", default=DEFAULT_BASE, help="Backend root URL")
    args = parser.parse_args()
    base = args.base_url.rstrip("/")
    client = httpx.Client(base_url=base, timeout=TIMEOUT, follow_redirects=True)

    print(f"Target: {base}\n")
    t0 = time.perf_counter()
    all_ok = True

    try:
        r = client.get("/api/health")
        all_ok &= check("health", r.status_code == 200 and r.json().get("status") == "ok", str(r.status_code))
    except Exception as exc:  # noqa: BLE001
        all_ok &= check("health", False, str(exc))
        print("\n백엔드에 연결할 수 없습니다. URL·서버 상태를 확인하세요.")
        return 1

    for source in ("naver_it", "naver_economy", "investing_economy"):
        try:
            r = client.get("/api/news", params={"source": source, "page": 1, "page_size": 3})
            data = r.json()
            count = len(data.get("items", []))
            total = data.get("total", 0)
            ok = r.status_code == 200 and count > 0
            all_ok &= check(
                f"news/{source}",
                ok,
                f"items={count}, total={total}" if ok else r.text[:120],
            )
        except Exception as exc:  # noqa: BLE001
            all_ok &= check(f"news/{source}", False, str(exc))

    try:
        r = client.get("/api/smk/results")
        ok = r.status_code == 200 and isinstance(r.json(), list)
        all_ok &= check("smk/results", ok, f"count={len(r.json())}" if ok else r.text[:120])
    except Exception as exc:  # noqa: BLE001
        all_ok &= check("smk/results", False, str(exc))

    # Chat needs OPENAI_API_KEY — only verify endpoint responds (not 502 CORS block).
    try:
        r = client.post(
            "/api/chat",
            json={"message": "ping", "history": []},
            headers={"Content-Type": "application/json"},
        )
        if r.status_code == 200 and "reply" in r.json():
            all_ok &= check("chat", True, "reply OK")
        elif r.status_code in (401, 500, 502):
            body = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
            detail = body.get("detail", r.text[:120])
            all_ok &= check(
                "chat",
                False,
                f"HTTP {r.status_code} - check OPENAI_API_KEY: {detail}",
            )
        else:
            all_ok &= check("chat", False, f"HTTP {r.status_code}: {r.text[:120]}")
    except Exception as exc:  # noqa: BLE001
        all_ok &= check("chat", False, str(exc))

    elapsed = time.perf_counter() - t0
    print(f"\nDone in {elapsed:.1f}s")
    if all_ok:
        print("All checks passed.")
        return 0
    print("Some checks failed. See README deploy section and env vars.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
