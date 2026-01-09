"""
Seed users to DynamoDB for the Music Voting app.
Run this script after deploying the SAM template.
"""
import boto3
import sys

# Users to seed - customize as needed
# username/displayName = person's name (lowercase for login matching)
# pin = memorable artist/band name
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

TABLE_NAME = 'musicvoting_users'


def seed_users(region: str = 'ap-southeast-2'):
    """Seed users to DynamoDB."""
    dynamodb = boto3.resource('dynamodb', region_name=region)
    table = dynamodb.Table(TABLE_NAME)

    print(f"Seeding {len(USERS)} users to {TABLE_NAME}...")

    for user in USERS:
        table.put_item(Item=user)
        print(f"  Added: {user['username']} ({user['displayName']})")

    print("Done!")


if __name__ == '__main__':
    region = sys.argv[1] if len(sys.argv) > 1 else 'ap-southeast-2'
    seed_users(region)
