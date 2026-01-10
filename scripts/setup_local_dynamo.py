"""
Setup local DynamoDB tables for the Music Voting app.

Prerequisites:
  - DynamoDB Local running: docker run -p 8000:8000 amazon/dynamodb-local
  - boto3 installed: pip install boto3

Usage:
  python scripts/setup_local_dynamo.py

Note: User authentication is handled entirely on the frontend (see config.ts).
      This script only creates the ballots table.
"""
import boto3
from botocore.exceptions import ClientError

ENDPOINT_URL = 'http://localhost:8000'


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
    create_table(dynamodb, 'musicvoting_ballots')

    # List tables
    list_tables(dynamodb)

    print("\n" + "=" * 50)
    print("Setup complete!")
    print("=" * 50)
    print("\nNote: User login is handled on the frontend (see config.ts)")
    print("      Only the ballots table is needed in DynamoDB")


if __name__ == '__main__':
    main()
