"""
Ballot Storage Lambda
Handles ballot storage in DynamoDB. No authentication - honor system for friends.
"""
import json
import os
from decimal import Decimal
from typing import Any
import boto3

# DynamoDB table names (set via environment variables)
BALLOTS_TABLE = os.environ.get('BALLOTS_TABLE', 'musicvoting_ballots')

# Local DynamoDB endpoint (set for local development)
DYNAMODB_ENDPOINT = os.environ.get('DYNAMODB_ENDPOINT', None)

# Connect to DynamoDB (local or AWS)
if DYNAMODB_ENDPOINT:
    dynamodb = boto3.resource(
        'dynamodb',
        endpoint_url=DYNAMODB_ENDPOINT,
        region_name='us-east-1',
        aws_access_key_id='dummy',
        aws_secret_access_key='dummy',
    )
else:
    dynamodb = boto3.resource('dynamodb')

ballots_table = dynamodb.Table(BALLOTS_TABLE)


def cors_headers() -> dict[str, str]:
    """Return CORS headers for the response.

    Note: When using Lambda Function URLs with CORS enabled,
    AWS handles CORS headers automatically. We only need Content-Type here.
    """
    return {}


def decimal_to_num(obj: Any) -> Any:
    """Convert Decimal objects to int/float for JSON serialization."""
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    if isinstance(obj, dict):
        return {k: decimal_to_num(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [decimal_to_num(i) for i in obj]
    return obj


def response(status_code: int, body: dict[str, Any] | list) -> dict[str, Any]:
    """Create a Lambda response with CORS headers."""
    return {
        'statusCode': status_code,
        'headers': {**cors_headers(), 'Content-Type': 'application/json'},
        'body': json.dumps(decimal_to_num(body)),
    }


def handle_get_ballot(username: str) -> dict[str, Any]:
    """Get a user's ballot."""
    try:
        result = ballots_table.get_item(Key={'username': username})
        ballot = result.get('Item')

        if not ballot:
            return response(404, {'error': 'Ballot not found'})

        return response(200, ballot)

    except Exception as e:
        print(f"Get ballot error: {e}")
        return response(500, {'error': 'Failed to get ballot'})


def handle_save_ballot(body: dict[str, Any]) -> dict[str, Any]:
    """Save a user's ballot."""
    username = body.get('username', '')
    entries = body.get('entries', [])
    submitted_at = body.get('submittedAt', '')

    if not username:
        return response(400, {'success': False, 'error': 'Username required'})

    if not entries or len(entries) == 0:
        return response(400, {'success': False, 'error': 'Ballot must contain at least 1 entry'})

    if len(entries) > 20:
        return response(400, {'success': False, 'error': 'Ballot cannot exceed 20 entries'})

    try:
        ballots_table.put_item(Item={
            'username': username,
            'entries': entries,
            'submittedAt': submitted_at,
            'isRescinded': False,  # Clear rescinded flag on save
        })
        return response(200, {'success': True})

    except Exception as e:
        print(f"Save ballot error: {e}")
        return response(500, {'success': False, 'error': 'Failed to save ballot'})


def handle_delete_ballot(username: str) -> dict[str, Any]:
    """Soft-delete a user's ballot by setting isRescinded flag."""
    if not username:
        return response(400, {'success': False, 'error': 'Username required'})

    try:
        # Soft delete - mark as rescinded instead of deleting
        ballots_table.update_item(
            Key={'username': username},
            UpdateExpression='SET isRescinded = :val, rescindedAt = :time',
            ExpressionAttributeValues={
                ':val': True,
                ':time': __import__('datetime').datetime.now().isoformat(),
            },
        )
        return response(200, {'success': True})

    except Exception as e:
        print(f"Delete ballot error: {e}")
        return response(500, {'success': False, 'error': 'Failed to rescind ballot'})


def handle_admin_get_ballots() -> dict[str, Any]:
    """Get all ballots."""
    try:
        result = ballots_table.scan()
        ballots = result.get('Items', [])

        # Handle pagination if needed
        while 'LastEvaluatedKey' in result:
            result = ballots_table.scan(ExclusiveStartKey=result['LastEvaluatedKey'])
            ballots.extend(result.get('Items', []))

        return response(200, ballots)

    except Exception as e:
        print(f"Admin get ballots error: {e}")
        return response(500, {'error': 'Failed to get ballots'})


def lambda_handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    """Lambda handler for ballot API. Supports both API Gateway and Function URL formats."""

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

    # Parse body for POST/PUT
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return response(400, {'error': 'Invalid JSON body'})

    # Route handling
    if '/admin/ballots' in path:
        if method == 'GET':
            return handle_admin_get_ballots()
        return response(405, {'error': 'Method not allowed'})

    if '/ballot' in path:
        # Extract username from path if present
        path_parts = path.rstrip('/').split('/')
        path_username = None
        if len(path_parts) >= 2 and path_parts[-2] == 'ballot':
            path_username = path_parts[-1]

        if method == 'GET' and path_username:
            return handle_get_ballot(path_username)
        elif method == 'POST':
            return handle_save_ballot(body)
        elif method == 'DELETE' and path_username:
            return handle_delete_ballot(path_username)
        return response(405, {'error': 'Method not allowed'})

    return response(404, {'error': 'Not found'})


# For local testing
if __name__ == '__main__':
    # Simulate DynamoDB with mocks
    class MockTable:
        def __init__(self):
            self.data = {}

        def get_item(self, Key):
            return {'Item': self.data.get(Key.get('username'))}

        def put_item(self, Item):
            self.data[Item['username']] = Item

        def delete_item(self, Key):
            self.data.pop(Key.get('username'), None)

        def scan(self):
            return {'Items': list(self.data.values())}

    ballots_table = MockTable()

    # Test save ballot
    print("Testing save ballot...")
    result = lambda_handler({
        'httpMethod': 'POST',
        'path': '/ballot',
        'body': json.dumps({
            'username': 'hen',
            'entries': [{'rank': i, 'trackId': f'track{i}'} for i in range(1, 21)],
            'submittedAt': '2025-01-01T00:00:00Z',
        }),
    }, None)
    print(result)

    # Test get ballot
    print("\nTesting get ballot...")
    result = lambda_handler({
        'httpMethod': 'GET',
        'path': '/ballot/hen',
    }, None)
    print(result)
