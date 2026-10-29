# MyGolfBuddy Architecture

## Architecture Overview

Version 1 uses a frontend-only architecture.

No backend required.

---

## High-Level Flow

User
|
v

Browser

|
v

GPS Location Service

|
v

Open-Meteo API

|
v

Golf Scoring Engine

|
v

Mobile User Interface

---

## Frontend Components

### Location Service

Responsibilities:

- Obtain coordinates
- Handle permissions
- Manage ZIP code fallback

Inputs:

- GPS
- ZIP Code

Outputs:

- Latitude
- Longitude

---

### Weather Service

Responsibilities:

- Call Open-Meteo APIs
- Normalize responses

Outputs:

- Current conditions
- Forecast data

---

### Golf Score Engine

Responsibilities:

- Evaluate current conditions
- Generate score
- Generate recommendation

Outputs:

- Score
- Rating
- Explanation

---

### UI Layer

Responsibilities:

- Display weather
- Display recommendations
- Mobile responsiveness

---

## Folder Structure

MyGolfBuddy/

├── PROJECT_CHARTER.md
├── PROJECT_REQUIREMENTS.md
├── ARCHITECTURE.md
├── ROADMAP.md

├── index.html
├── style.css
├── script.js

├── assets/

└── .github/
    └── copilot-instructions.md

---

## Future Architecture

Azure Static Web App

|

Azure Functions

|

Weather APIs
Maps APIs
Golf APIs

---

## Technology Stack

### MVP

- HTML5
- CSS3
- JavaScript
- Open-Meteo

### Future

- React
- TypeScript
- Azure Functions
- Google Maps API
- GolfNow API

---

## Design Principles

- Mobile First
- Responsive
- Accessible
- Performant
- Low Maintenance

## Phase 1.1 - Daylight Aware Playability

### New Data Elements

- Sunrise Time
- Sunset Time
- Remaining Daylight

### Updated Recommendation Engine

Location
    ↓
Weather
    ↓
Golf Score
    ↓
Daylight Evaluation
    ↓
Final Recommendation

### Recommendation Factors

- Weather Conditions
- Golf Score
- Sunrise Time
- Sunset Time
- Remaining Daylight

A favorable weather score alone does not guarantee a golf recommendation.
