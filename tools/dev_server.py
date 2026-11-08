"""Локальный сервер для разработки: как `python -m http.server`, но запрещает кэш.
Без этого браузер (особенно Safari на телефоне) после правок может показывать старые файлы.
Запуск из папки проекта:  python tools/dev_server.py 5173
"""
import http.server
import socketserver
import sys
from functools import partial
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent  # папка weather-kz


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    handler = partial(NoCacheHandler, directory=str(ROOT))
    with Server(("", port), handler) as httpd:  # "" — доступен и с телефона в той же Wi-Fi сети
        print(f"Serving {ROOT} on http://localhost:{port} (no cache)")
        httpd.serve_forever()
