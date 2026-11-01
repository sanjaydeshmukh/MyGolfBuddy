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
The final recommendation displayed to the user
shall be determined using both:

- Golf Score
- Remaining Daylight

A high Golf Score alone does not guarantee
that golf is recommended.

------------------------------------------------
Phase 1.1 - Daylight Aware Playability
------------------------------------------------

## Daylight Evaluation

MyGolfBuddy shall evaluate remaining daylight
before providing a final golf recommendation.

### Daylight Recommendation Matrix

| Remaining Daylight | Recommendation |
|-------------------|----------------|
| More than 4 hours | Excellent for a full round |
| 2-4 hours | Good for a full round |
| 1-2 hours | Good for a short round |
| 30-60 minutes | Limited daylight remaining |
| Less than 30 minutes | Insufficient daylight - Try tomorrow |
| After sunset | Not playable today |

### Night Time Handling

When the current time is after sunset:

- Daylight Remaining shall not be displayed.
- The application shall not display "0 minutes remaining".
- The application shall display a nighttime message.

Example:

🌙 It's Night Time

Golf is not recommended right now.

#### Recommendation Engine

Generate a human-readable recommendation.
Final recommendations shall consider:

- Weather conditions
- Golf score
- Remaining daylight
- Sunset time
Examples: 

Example 1 - 
🏌️ Excellent For Golf

Golf Score: 92

Sunset: 6:18 PM
Daylight Remaining: 5h 12m

You have approximately 5 hours of playable daylight remaining.

Current weather conditions are excellent for golf and there is plenty of daylight available for a full round.

--
Example 2 
🏌️ Good For Golf

Golf Score: 82

Sunset: 6:18 PM
Daylight Remaining: 2h 34m

You have approximately 2 hours and 34 minutes of playable daylight remaining.

Conditions are suitable for golf and there is enough daylight for a short round or practice session.

--
Example 3
⚠️ Limited Daylight Remaining

Golf Score: 88

Sunset: 6:18 PM
Daylight Remaining: 47m

Weather conditions are favorable, but only 47 minutes of daylight remain.

You may have enough time for practice or a few holes before sunset.

--
Example 4
🌅 Insufficient Daylight

Golf Score: 95

Sunset: 6:18 PM
Daylight Remaining: 18m

Although weather conditions are excellent for golf, only 18 minutes of daylight remain.

There is insufficient daylight remaining to begin a golf round.

Try again tomorrow.

--
Example 5 

🌙 It's Night Time

Golf Score: 90

Sunset: 6:18 PM

Golf is not recommended right now.

There is no remaining daylight available today.

Try again tomorrow.

-- 
Example 6
❌ Not Recommended

Golf Score: 42

Sunset: 6:18 PM
Daylight Remaining: 4h 51m

There is sufficient daylight available today, however current weather conditions are not favorable for golf.

Strong winds and rain are expected.

--
Example 7
✅ Excellent For Golf

Golf Score: 91

Daylight Remaining:
4h 22m

You have approximately 4 hours of playable daylight remaining.

Recommended Nearby Courses

Mercer Oaks Golf Course
11 min drive

Mountain View Golf Course
13 min drive

Hopewell Valley Golf Club
14 min drive

Recommendation:
Enough daylight remains for a full round of golf.
---


------------------------------------------------
## Release 2.0 - Nearby Golf Courses
------------------------------------------------

### Goal

Extend MyGolfBuddy from:

"Can I play golf today?"

to

"Can I play golf today, and where should I go?"

---

## Nearby Golf Courses

The application shall display nearby golf courses
when golf is recommended.

Courses shall be identified using:

- GPS location
- ZIP code location

---

## Data Source

Primary Source:

- Google Maps Places API

---

## Search Radius

Search for golf courses within:

- 15 mile radius

--

## Course Display Limits

Display up to 5 golf courses.

If fewer than 5 courses are found,
display all available courses.

Results shall be sorted by distance from nearest to farthest.
---
### Distance and Drive Time Display

Display distance for all nearby courses.

Drive time shall only be displayed when available.

If drive time is unavailable, the application shall display distance only.

Examples:

5.8 miles

7.2 miles · 13 min drive

The application shall not display:

"Drive time unavailable"
--

## Course Information

Display:

- Course name
- Address
- Distance
- Estimated drive time

Example:

Mercer Oaks Golf Course
12 xyz road , Princeton, NJ 08536
11 min drive
5.8 miles

Mountain View Golf Course
24 abc road , Princeton, NJ 08536
13 min drive
7.2 miles

Hopewell Valley Golf Club
45 wzp road , Princeton, NJ 08536
14 min drive
7.9 miles

---

## Recommendation Integration

When golf is recommended,
display nearby courses below the recommendation.

Example:

✅ Excellent For Golf

Golf Score: 91

Daylight Remaining: 4h 22m

Recommended Nearby Courses

Mercer Oaks Golf Course
12 xyz road , Princeton, NJ 08536

11 min drive

Mountain View Golf Course
34 abc road , Princeton, NJ 08536

13 min drive

Hopewell Valley Golf Club
45 aln road , Princeton, NJ 08536

14 min drive

Recommendation:

Enough daylight remains for a full round.

---

## Limited Daylight Integration

When remaining daylight is less than 60 minutes:

Display only nearby courses within a short drive.

Example:

⚠ Limited Daylight Remaining

Daylight Remaining: 59 minutes

Recommended Nearby Courses

Mercer Oaks Golf Course
12 xyz road , Princeton, NJ 08536

11 min drive

Recommendation:

Enough time for practice or a few holes.

---

## Navigation Support

Each golf course shall include:

- Open in Google Maps

Selecting a course shall launch Google Maps
for navigation.

---

## Not Playable Today

When:

- After sunset
- Less than 30 minutes daylight
- Golf score below recommendation threshold
Recommendation Thresholds

90-100 Excellent
75-89 Good
60-74 Fair
0-59 Not Recommended

The application shall not display course recommendations.

Example:

🌙 Not Playable Today

No nearby course recommendations are shown
because golf is not recommended currently.

---
## No Courses Found

If no golf courses are found within the search area:

Display:

"No nearby golf courses found."

The application shall continue displaying
weather and golf recommendations normally.


## Error Handling

If the Google Maps API is unavailable:

Display:

"Unable to retrieve nearby golf courses."

Golf recommendation functionality shall continue operating.


## Release 2.0 Acceptance Criteria

The release is complete when:

- GPS location is supported.
- ZIP code location is supported.
- Golf courses are retrieved within a 15 mile radius.
- Up to 5 nearby courses are displayed.
- Results are sorted by distance.
- Course name is displayed.
- Distance is displayed.
- Google Maps navigation link is available.
- No course recommendations are displayed when golf is not recommended.
- No-results scenarios are handled gracefully.
- API failures are handled gracefully.

## Security

Google API keys shall not be hardcoded in client-side source code.

Environment variables shall be used where supported.

##

## Mobile Compatibility

The application shall support:

- Android browsers
- iPhone browsers
- Responsive design
- Portrait orientation
##