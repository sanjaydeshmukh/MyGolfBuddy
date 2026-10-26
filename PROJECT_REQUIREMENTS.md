# MyGolfBuddy Requirements

## Release 1.0 (MVP)

### Functional Requirements

#### Location Detection

The application shall:

- Obtain user GPS location.
- Request permission from browser.
- Support manual ZIP code entry if GPS is unavailable.

---

#### Weather Information

Retrieve:

- Temperature
- Wind Speed
- Humidity
- Weather Conditions
- Precipitation
- Cloud Cover

Source:

- Open-Meteo API

---

#### Golf Score

Generate a score from 0 to 100.

Scoring factors:

| Factor | Weight |
|----------|----------|
| Temperature | High |
| Wind Speed | High |
| Rain | High |
| Thunderstorms | Critical |
| Humidity | Medium |
| Cloud Cover | Low |

---

#### Golf Rating

Display:

- Excellent
- Good
- Fair
- Poor

Example:

Golf Score: 92

Rating: Excellent

---

#### Recommendation Engine

Generate a human-readable recommendation.

Example:

Excellent conditions for golf.

Temperatures are comfortable, winds are light, and no precipitation is expected.

---

## Future Requirements

### Nearby Golf Courses

Display:

- Course name
- Distance
- Estimated drive time

Filter:

- Within 15 minutes driving time

---

### Tee Time Availability

Display:

- Next available tee time
- Booking URL

Search window:

- Next 60 minutes

---

### Personalization

Support:

- Favorite courses
- Home location
- Weather preferences

---

### Notifications

Support:

- Daily alerts
- Weather alerts
- Tee-time alerts