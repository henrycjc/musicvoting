# Music Voting App

A Hottest 100-style voting application for private use. Users select and rank their top 20 songs of the year, with Spotify as the source of truth for track data.

## Features

- **Song Search**: Search Spotify for tracks with album art and release date info
- **Drag-and-Drop Ranking**: Rank your top 20 songs with an intuitive drag-and-drop interface
- **Release Date Warnings**: Visual warnings for songs outside the voting year
- **Local Storage Draft**: Your ballot is saved locally as you work
- **Ballot Submission**: Submit your ballot with PIN-based authentication
- **Rescind Votes**: Rescind your vote to make changes and resubmit
- **Admin Results View**: View results with multiple ranking algorithms (Borda, Harmonic, Logarithmic, Bayesian)
- **Spotify Integration Placeholder**: "Sign in with Spotify" for top songs import (coming soon)

## Architecture

```
musicvoting/
├── musicvoting_frontend/    # React 18 + Tailwind + Headless UI
├── backend_spotify/         # Python Lambda - Spotify API proxy
├── backend_ballot/          # Python Lambda - Auth + DynamoDB storage
├── template.yaml            # AWS SAM template
├── local_server.py          # Local development server
└── scripts/
    └── seed_users.py        # Seed users to DynamoDB
```

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.12+
- Spotify Developer Account (for API credentials)

### Setup

1. **Frontend**
   ```bash
   cd musicvoting_frontend
   npm install
   npm run dev
   ```

2. **Backend (Local)**
   ```bash
   # Set Spotify credentials
   export SPOTIFY_CLIENT_ID=your_client_id
   export SPOTIFY_CLIENT_SECRET=your_client_secret

   # Run local servers
   python local_server.py
   ```

3. **Access**
   - Frontend: http://localhost:5173
   - Default PIN for all users: `1234`

## AWS Deployment

### Prerequisites

- AWS CLI configured
- AWS SAM CLI installed
- Spotify API credentials

### Deploy

```bash
# Build and deploy
sam build
sam deploy --guided

# Parameters needed:
# - SpotifyClientId
# - SpotifyClientSecret

# Seed users to DynamoDB
python scripts/seed_users.py ap-southeast-2
```

### Update Frontend Config

After deployment, update `musicvoting_frontend/src/config.ts` with API Gateway URLs:

```typescript
export const CONFIG = {
  SPOTIFY_API_URL: 'https://xxx.execute-api.ap-southeast-2.amazonaws.com/prod',
  BALLOT_API_URL: 'https://yyy.execute-api.ap-southeast-2.amazonaws.com/prod',
  // ...
};
```

Or use environment variables:
```bash
VITE_SPOTIFY_API_URL=https://xxx... npm run build
```

## Users

Edit `scripts/seed_users.py` to customize users and PINs before deployment.

Edit `musicvoting_frontend/src/config.ts` to update the USERS array for the frontend dropdown.

## Ranking Algorithms

The results viewer supports multiple ranking algorithms:

| Algorithm | Formula | Description |
|-----------|---------|-------------|
| Borda Count | 21 - rank | 1st=20pts, 2nd=19pts, ... 20th=1pt |
| Harmonic | 1 / rank | 1st=1pt, 2nd=0.5pt, 3rd=0.33pt, ... |
| Logarithmic | log2(21 - rank) | Emphasizes top positions logarithmically |
| Bayesian | (21 - rank) / 20 | Normalized 0-1 scale |

## Security Notes

- PIN codes are stored in plain text (as per requirements - private use only)
- Tokens are simple session tokens stored in memory
- No HTTPS enforcement locally (use HTTPS in production via API Gateway)
- CORS is open for development; restrict in production
