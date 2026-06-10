import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from config import API_HOST, API_PORT, CORS_ORIGIN
from pinger import get_state, start_pinger

class _Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path != "/api/nodes":
            self.send_response(404)
            self.end_headers()
            return

        body = json.dumps(get_state()).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", CORS_ORIGIN)
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", CORS_ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.end_headers()

    def log_message(self, fmt, *args):
        pass  # silencia logs de acesso padrão

if __name__ == "__main__":
    start_pinger()
    addr = (API_HOST, API_PORT)
    httpd = HTTPServer(addr, _Handler)
    print(f"Backend rodando em  http://{API_HOST}:{API_PORT}")
    print(f"Endpoint disponível: http://{API_HOST}:{API_PORT}/api/nodes")
    print("Ctrl+C para encerrar.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nEncerrado.")
        sys.exit(0)
