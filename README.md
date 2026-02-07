# AI Email Outreach Agent

A complete system for automated, personalized cold email outreach using OpenAI GPT-4 and Gmail API.

## Features
- **CSV Import**: Easily upload leads with business data.
- **AI Personalization**: GPT-4 generates unique, contextual emails for every lead.
- **Automated Follow-ups**: Intelligently follows up if no response is received.
- **Sentiment Analysis**: Automatically categorizes replies as Positive, Negative, or Neutral.
- **Meeting Scheduling**: Integrated with Google Calendar (WIP).

## Tech Stack
- **Frontend**: React, Tailwind CSS, Lucide React, Axios.
- **Backend**: Node.js, Express, SQLite, Sequelize, OpenAI SDK, Google APIs.

## Setup Instructions

### 1. Prerequisites
- Node.js (v16+)
- OpenAI API Key
- Google Cloud Console Project (with Gmail & Calendar APIs enabled)

### 2. Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file based on `.env.example`.
4. Run the server: `node server.js`

### 3. Frontend Setup
1. `cd frontend`
2. `npm install`
3. Run the dev server: `npm run dev`

### 4. Configuration
- Obtain Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/).
- Set up a redirect URI: `http://localhost:5000/api/auth/google/callback`.
- Add your OpenAI API key to `backend/.env`.

## Database Schema
The system uses SQLite. Models include:
- `Leads`: Stores lead contact info and status.
- `Emails`: History of sent emails (initial and follow-up).
- `Responses`: Stores incoming replies and their sentiment analysis.
- `Meetings`: Planned meetings (triggered by positive sentiment).
