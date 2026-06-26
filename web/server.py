import http.server
import socket
import os
import json
import mimetypes
from datetime import datetime, timezone

HOSTNAME = socket.gethostname()
START_TIME = datetime.now(timezone.utc)
STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static')

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            uptime = str(datetime.now(timezone.utc) - START_TIME).split('.')[0]
            self.wfile.write(json.dumps({
                'status': 'healthy',
                'hostname': HOSTNAME,
                'started': START_TIME.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'uptime': uptime
            }).encode())
            return

        if self.path == '/kill':
            print(f"[{HOSTNAME}] Chaos monkey killed me!")
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'dying...')
            os._exit(1)

        path = self.path
        if path == '/':
            path = '/index.html'

        file_path = os.path.join(STATIC_DIR, path.lstrip('/'))
        file_path = os.path.normpath(file_path)

        if not file_path.startswith(STATIC_DIR):
            self.send_response(403)
            self.end_headers()
            return

        if os.path.isfile(file_path):
            self.send_response(200)
            content_type, _ = mimetypes.guess_type(file_path)
            self.send_header('Content-Type', content_type or 'application/octet-stream')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
        else:
            index_path = os.path.join(STATIC_DIR, 'index.html')
            if os.path.isfile(index_path):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.send_header('Cache-Control', 'no-cache')
                self.end_headers()
                with open(index_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()

    def log_message(self, format, *args):
        print(f"[{HOSTNAME}] {args[0]} {args[1]} {args[2]}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    server = http.server.HTTPServer(('0.0.0.0', port), Handler)
    print(f"[{HOSTNAME}] Server running on port {port}")
    server.serve_forever()
