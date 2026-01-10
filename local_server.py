"""
Local development server for testing the Music Voting app.
Runs both Spotify and Ballot APIs on different ports.

Requires DynamoDB Local:
  docker run -p 8000:8000 amazon/dynamodb-local

Setup tables:
  python scripts/setup_local_dynamo.py
"""
import http.server
import os
import sys
import threading
from urllib.parse import urlparse, parse_qs

# Set DynamoDB endpoint before importing lambda
os.environ['DYNAMODB_ENDPOINT'] = 'http://localhost:8000'

# Add backend directories to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend_spotify'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend_ballot'))

# Import lambdas once at module level so state (like auth tokens) persists
import backend_ballot.lambda_function as ballot_lambda
import backend_spotify.lambda_function as spotify_lambda


def check_dynamodb_connection():
    """Check if DynamoDB Local is running and tables exist."""
    try:
        import boto3
        dynamodb = boto3.resource(
            'dynamodb',
            endpoint_url='http://localhost:8000',
            region_name='us-east-1',
            aws_access_key_id='dummy',
            aws_secret_access_key='dummy',
        )
        client = dynamodb.meta.client
        tables = client.list_tables()['TableNames']

        if 'musicvoting_ballots' not in tables:
            print("[ERROR] Missing table: musicvoting_ballots")
            print("        Run: python scripts/setup_local_dynamo.py")
            return False

        print("[OK] DynamoDB Local connected")
        return True

    except Exception as e:
        error_msg = str(e)
        if 'Connection refused' in error_msg or 'NewConnectionError' in error_msg:
            print("[ERROR] Cannot connect to DynamoDB Local at http://localhost:8000")
            print("        Run: docker run -p 8000:8000 amazon/dynamodb-local")
        else:
            print(f"[ERROR] DynamoDB error: {e}")
        return False


class SpotifyHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        query_params = parse_qs(parsed.query)

        event = {
            'httpMethod': 'GET',
            'path': parsed.path,
            'queryStringParameters': {k: v[0] for k, v in query_params.items()},
        }

        result = spotify_lambda.lambda_handler(event, None)

        self.send_response(result['statusCode'])
        self.send_header('Access-Control-Allow-Origin', '*')
        for key, value in result.get('headers', {}).items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(result.get('body', '').encode())

    def log_message(self, format, *args):
        print(f"[Spotify] {args[0]}")


class BallotHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def handle_request(self, method: str, body: str = ''):
        parsed = urlparse(self.path)

        event = {
            'httpMethod': method,
            'path': parsed.path,
            'headers': dict(self.headers),
            'body': body,
        }

        # Debug logging
        print(f"[Ballot] {method} {parsed.path}")
        print(f"[Ballot] Headers: {dict(self.headers)}")
        if body:
            print(f"[Ballot] Body: {body[:200]}")

        result = ballot_lambda.lambda_handler(event, None)

        print(f"[Ballot] Response: {result['statusCode']} - {result.get('body', '')[:200]}")

        self.send_response(result['statusCode'])
        self.send_header('Access-Control-Allow-Origin', '*')
        for key, value in result.get('headers', {}).items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(result.get('body', '').encode())

    def do_GET(self):
        self.handle_request('GET')

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode()
        self.handle_request('POST', body)

    def do_DELETE(self):
        self.handle_request('DELETE')

    def log_message(self, format, *args):
        print(f"[Ballot] {args[0]}")


def run_server(handler_class, port: int, name: str):
    server = http.server.HTTPServer(('', port), handler_class)
    print(f"{name} server running on http://localhost:{port}")
    server.serve_forever()


if __name__ == '__main__':
    print("=" * 50)
    print("Music Voting Local Development Server")
    print("=" * 50)
    print()

    # Check DynamoDB connection before starting
    if not check_dynamodb_connection():
        print()
        print("Fix the above errors and try again.")
        sys.exit(1)

    # Check Spotify credentials
    if not os.environ.get('SPOTIFY_CLIENT_ID') or not os.environ.get('SPOTIFY_CLIENT_SECRET'):
        print("[WARN] SPOTIFY_CLIENT_ID/SPOTIFY_CLIENT_SECRET not set - Spotify search won't work")
    else:
        print("[OK] Spotify credentials found")

    print()

    spotify_thread = threading.Thread(
        target=run_server,
        args=(SpotifyHandler, 3001, "Spotify"),
        daemon=True
    )
    ballot_thread = threading.Thread(
        target=run_server,
        args=(BallotHandler, 3002, "Ballot"),
        daemon=True
    )

    spotify_thread.start()
    ballot_thread.start()

    print("Frontend: cd musicvoting_frontend && npm run dev")
    print("Press Ctrl+C to stop")
    print()

    try:
        while True:
            spotify_thread.join(timeout=1)
            ballot_thread.join(timeout=1)
    except KeyboardInterrupt:
        print("\nShutting down...")
