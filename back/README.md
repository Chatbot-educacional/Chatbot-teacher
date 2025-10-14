# Metrics API (PocketBase session tracking)

Backend API (Node.js + Express, ESM) that creates and closes session documents in PocketBase.
Designed to be minimal, professional and ready for deployment.

## Features
- `POST /api/session/start` : create a session document (start_time)
- `POST /api/session/end` : update session document (end_time + duration_seconds)
- Uses PocketBase SDK
- Clean structure (controllers, routes, services)

## Setup
1. Copy `.env.example` to `.env` and edit `POCKETBASE_URL` (and admin credentials if needed).
2. Install dependencies:
   ```
   npm install
   ```
3. Start server:
   ```
   npm start
   ```

## Endpoints
- Start session
  ```
  POST /api/session/start
  Content-Type: application/json
  Body: { "userId": "USER_ID" }
  ```
  Response: { message, data: { id, start_time, ... } }

- End session
  ```
  POST /api/session/end
  Content-Type: application/json
  Body: { "sessionId": "SESSION_ID" }
  ```
  Response: { message, duration_seconds, duration_minutes, data: { ... } }

## PocketBase collection `sessions`
Suggested fields:
- user (relation -> users) [required]
- start_time (date)
- end_time (date)
- duration_seconds (number)

## Notes
- If you provide admin credentials in `.env`, the server will attempt to authenticate as admin at startup.
- Otherwise, the server will operate without admin auth (useful if front-end handles auth).
