"""A local stand-in for PostHog, used by scripts/masking-proof.py.

It answers the endpoints the SDK needs (remote config and flags), serves the real recorder and other lazy
scripts out of node_modules so the genuine rrweb recorder runs, and writes every POST body it receives to a
file. Nothing reaches PostHog, and the recorder's own output is captured exactly as it would be sent.

Run: python scripts/posthog-stub.py <port> <capture-file>
"""
import json, os, sys, threading
from http.server import BaseHTTPRequestHandler, HTTPServer

DIST = os.path.join("node_modules", "posthog-js", "dist")
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3132
CAPTURE = sys.argv[2] if len(sys.argv) > 2 else "posthog-capture.bin"

CONFIG = {
    "token": "phc_canary",
    "supportedCompression": ["gzip-js"],
    "hasFeatureFlags": False,
    "analytics": {"endpoint": "/i/v0/e/"},
    "elementsChainAsString": True,
    "sessionRecording": {
        "endpoint": "/s/",
        "recorderVersion": "v2",
        "consoleLogRecordingEnabled": False,
        "sampleRate": None,
        "minimumDurationMilliseconds": 0,
        "maskAllInputs": True,
        "maskTextSelector": "*",
    },
    "surveys": False,
    "defaultIdentifiedOnly": True,
    "siteApps": [],
    "capturePerformance": False,
    "autocapture_opt_out": False,
    "autocaptureExceptions": False,
    "featureFlags": {},
    "isAuthenticated": False,
    "config": {"enable_collect_everything": True},
}

lock = threading.Lock()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]
        if path.endswith("/config.js"):
            return self._send(b"//", "application/javascript")
        if path.endswith("/config") or "/flags" in path or "/decide" in path:
            return self._send(json.dumps(CONFIG).encode(), "application/json")
        if "/static/" in path:
            name = os.path.basename(path)
            local = os.path.join(DIST, name)
            if os.path.exists(local):
                with open(local, "rb") as f:
                    return self._send(f.read(), "application/javascript")
            return self._send(b"", "application/javascript", status=404)
        return self._send(b"{}", "application/json")

    def do_POST(self):
        length = int(self.headers.get("content-length") or 0)
        body = self.rfile.read(length) if length else b""
        if body:
            with lock, open(CAPTURE, "ab") as f:
                # url \n length \n body, so the reader can split a binary stream back into requests.
                f.write(f"===URL {self.path}\n===LEN {len(body)}\n".encode())
                f.write(body)
                f.write(b"\n")
        path = self.path.split("?")[0]
        if path.endswith("/config") or "/flags" in path or "/decide" in path:
            return self._send(json.dumps(CONFIG).encode(), "application/json")
        return self._send(b'{"status":1}', "application/json")

    def _send(self, payload: bytes, ctype: str, status: int = 200):
        self.send_response(status)
        self.send_header("content-type", ctype)
        self.send_header("content-length", str(len(payload)))
        self._cors()
        self.end_headers()
        self.wfile.write(payload)


if __name__ == "__main__":
    open(CAPTURE, "wb").close()
    print(f"posthog stub on {PORT}, capturing to {CAPTURE}", flush=True)
    HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
