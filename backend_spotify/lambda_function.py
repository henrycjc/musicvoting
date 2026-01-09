"""
Spotify API Proxy Lambda
Handles Spotify API queries for track search.
"""
import json
import os
import base64
import urllib.request
import urllib.parse
from typing import Any

# Spotify API credentials (set via environment variables)
SPOTIFY_CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID', '')
SPOTIFY_CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET', '')

# Cache access token (within Lambda execution context)
_access_token: str | None = None
_token_expires: float = 0


def get_access_token() -> str:
    """Get Spotify API access token using client credentials flow."""
    global _access_token, _token_expires

    import time
    if _access_token and time.time() < _token_expires:
        return _access_token

    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        raise ValueError("Spotify client ID and secret must be set in environment variables.")
    credentials = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()

    data = urllib.parse.urlencode({'grant_type': 'client_credentials'}).encode()
    req = urllib.request.Request(
        'https://accounts.spotify.com/api/token',
        data=data,
        headers={
            'Authorization': f'Basic {encoded_credentials}',
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    )

    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        _access_token = result['access_token']
        _token_expires = time.time() + result['expires_in'] - 60  # 1 min buffer
        return _access_token


def search_tracks(query: str, limit: int = 20) -> list[dict[str, Any]]:
    """Search for tracks on Spotify."""
    token = get_access_token()

    params = urllib.parse.urlencode({
        'q': query,
        'type': 'track',
        'limit': limit,
        'market': 'AU',  # Australia market
    })

    req = urllib.request.Request(
        f'https://api.spotify.com/v1/search?{params}',
        headers={'Authorization': f'Bearer {token}'}
    )

    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        return result.get('tracks', {}).get('items', [])


def format_track(track: dict[str, Any]) -> dict[str, Any]:
    """Format a Spotify track for the frontend."""
    return {
        'id': track['id'],
        'name': track['name'],
        'artists': [{'id': a['id'], 'name': a['name']} for a in track['artists']],
        'album': {
            'id': track['album']['id'],
            'name': track['album']['name'],
            'images': track['album']['images'],
            'release_date': track['album']['release_date'],
        },
        'duration_ms': track['duration_ms'],
        'preview_url': track.get('preview_url'),
        'external_urls': track['external_urls'],
    }


def cors_headers() -> dict[str, str]:
    """Return CORS headers for the response.

    Note: When using Lambda Function URLs with CORS enabled,
    AWS handles CORS headers automatically. We return empty here.
    """
    return {}


def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    """Lambda handler for Spotify API proxy. Supports both API Gateway and Function URL formats."""

    # Function URL uses requestContext.http, API Gateway uses httpMethod directly
    if 'requestContext' in event and 'http' in event.get('requestContext', {}):
        # Function URL format
        method = event['requestContext']['http']['method']
        path = event.get('rawPath', '')
    else:
        # API Gateway format (also used by local server)
        method = event.get('httpMethod', '')
        path = event.get('path', '')

    # Handle CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': '',
        }

    query_params = event.get('queryStringParameters') or {}

    try:
        if path == '/search' or path.endswith('/search'):
            query = query_params.get('q', '')
            if not query:
                return {
                    'statusCode': 400,
                    'headers': cors_headers(),
                    'body': json.dumps({'error': 'Query parameter "q" is required'}),
                }

            tracks = search_tracks(query)
            formatted_tracks = [format_track(t) for t in tracks]

            return {
                'statusCode': 200,
                'headers': {**cors_headers(), 'Content-Type': 'application/json'},
                'body': json.dumps({'tracks': formatted_tracks}),
            }

        return {
            'statusCode': 404,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Not found'}),
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': 'Internal server error'}),
        }


# For local testing
if __name__ == '__main__':
    # Test search
    event = {
        'httpMethod': 'GET',
        'path': '/search',
        'queryStringParameters': {'q': 'Taylor Swift'},
    }
    result = lambda_handler(event, None)
    print(json.dumps(json.loads(result['body']), indent=2))
