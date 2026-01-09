"""
Setup local DynamoDB tables and seed users.

Prerequisites:
  - DynamoDB Local running: docker run -p 8000:8000 amazon/dynamodb-local
  - boto3 installed: pip install boto3

Usage:
  python scripts/setup_local_dynamo.py
"""
import boto3
from botocore.exceptions import ClientError

ENDPOINT_URL = 'http://localhost:8000'

# Users to seed - username = person's name, pin = memorable artist/band
USERS = [
    {'username': 'aidan', 'displayName': 'aidan', 'pin': 'bowie'},
    {'username': 'aleesha', 'displayName': 'aleesha', 'pin': 'cher'},
    {'username': 'alisha', 'displayName': 'alisha', 'pin': 'adele'},
    {'username': 'andyr', 'displayName': 'andyr', 'pin': 'prince'},
    {'username': 'andym', 'displayName': 'andym', 'pin': 'drake'},
    {'username': 'annika', 'displayName': 'annika', 'pin': 'bjork'},
    {'username': 'beulah', 'displayName': 'beulah', 'pin': 'madonna'},
    {'username': 'cathy', 'displayName': 'cathy', 'pin': 'beyonce'},
    {'username': 'charlie', 'displayName': 'charlie', 'pin': 'coldplay'},
    {'username': 'danielle', 'displayName': 'danielle', 'pin': 'sia'},
    {'username': 'dave', 'displayName': 'dave', 'pin': 'oasis'},
    {'username': 'dec', 'displayName': 'dec', 'pin': 'nirvana'},
    {'username': 'dom', 'displayName': 'dom', 'pin': 'radiohead'},
    {'username': 'jake', 'displayName': 'jake', 'pin': 'blur'},
    {'username': 'ella', 'displayName': 'ella', 'pin': 'lorde'},
    {'username': 'emily', 'displayName': 'emily', 'pin': 'rihanna'},
    {'username': 'erin', 'displayName': 'erin', 'pin': 'abba'},
    {'username': 'graham', 'displayName': 'graham', 'pin': 'queen'},
    {'username': 'hellen', 'displayName': 'hellen', 'pin': 'fleetwood'},
    {'username': 'hen', 'displayName': 'hen', 'pin': 'zeppelin'},
    {'username': 'josh', 'displayName': 'josh', 'pin': 'toto'},
    {'username': 'josie', 'displayName': 'josie', 'pin': 'blondie'},
    {'username': 'louis', 'displayName': 'louis', 'pin': 'daft'},
    {'username': 'luke', 'displayName': 'luke', 'pin': 'gorillaz'},
    {'username': 'matthew', 'displayName': 'matthew', 'pin': 'muse'},
    {'username': 'max', 'displayName': 'max', 'pin': 'acdc'},
    {'username': 'nat', 'displayName': 'nat', 'pin': 'pink'},
    {'username': 'natasha', 'displayName': 'natasha', 'pin': 'shakira'},
    {'username': 'nikola', 'displayName': 'nikola', 'pin': 'tesla'},
    {'username': 'peter', 'displayName': 'peter', 'pin': 'genesis'},
    {'username': 'sarah', 'displayName': 'sarah', 'pin': 'flume'},
    {'username': 'sean', 'displayName': 'sean', 'pin': 'arctic'},
]


def get_dynamodb():
    return boto3.resource(
        'dynamodb',
        endpoint_url=ENDPOINT_URL,
        region_name='us-east-1',
        aws_access_key_id='dummy',
        aws_secret_access_key='dummy',
    )


def create_table(dynamodb, table_name: str):
    """Create a table if it doesn't exist."""
    try:
        table = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {'AttributeName': 'username', 'KeyType': 'HASH'},
            ],
            AttributeDefinitions=[
                {'AttributeName': 'username', 'AttributeType': 'S'},
            ],
            BillingMode='PAY_PER_REQUEST',
        )
        table.wait_until_exists()
        print(f"Created table: {table_name}")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print(f"Table already exists: {table_name}")
        else:
            raise


def seed_users(dynamodb):
    """Seed users to the users table."""
    table = dynamodb.Table('musicvoting_users')

    for user in USERS:
        table.put_item(Item=user)
        print(f"  Added user: {user['username']} (PIN: {user['pin']})")


def list_tables(dynamodb):
    """List all tables."""
    client = dynamodb.meta.client
    tables = client.list_tables()['TableNames']
    print(f"\nTables: {tables}")


def main():
    print("=" * 50)
    print("DynamoDB Local Setup")
    print("=" * 50)
    print(f"\nConnecting to {ENDPOINT_URL}...")

    try:
        dynamodb = get_dynamodb()

        # Test connection
        dynamodb.meta.client.list_tables()
        print("Connected!\n")

    except Exception as e:
        print(f"\nError: Could not connect to DynamoDB Local at {ENDPOINT_URL}")
        print("Make sure DynamoDB Local is running:")
        print("  docker run -p 8000:8000 amazon/dynamodb-local")
        print(f"\nDetails: {e}")
        return

    # Create tables
    print("Creating tables...")
    create_table(dynamodb, 'musicvoting_users')
    create_table(dynamodb, 'musicvoting_ballots')

    # Seed users
    print("\nSeeding users...")
    seed_users(dynamodb)

    # List tables
    list_tables(dynamodb)

    print("\n" + "=" * 50)
    print("Setup complete!")
    print("=" * 50)
    print("\nLogin with your name as username and artist name as PIN (case-insensitive)")
    print("Example: username='hen', pin='zeppelin'")


if __name__ == '__main__':
    main()
