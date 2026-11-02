# MyGolfBuddy Runtime Sequence Diagram

This sequence diagram shows startup, GPS and ZIP code location flows, weather retrieval, golf scoring, daylight checks, and nearby-course search.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant HTML as index.html
    participant JS as script.js
    participant Geo as Browser Geolocation
    participant GeoAPI as Open-Meteo Geocoding API
    participant WeatherAPI as Open-Meteo Forecast API
    participant Maps as Google Maps JavaScript API
    participant Places as Google Places searchNearby
    participant DOM as DOM styled by style.css
    participant Azure as Azure Static Web Apps

    Note over Azure,HTML: On main push or eligible pull request, GitHub Actions uploads index.html, style.css and script.js; PR close triggers preview close.
    User->>Azure: Open deployed app URL
    Azure-->>HTML: Serve static application files
    HTML->>DOM: Parse app shell and build location/forecast/course containers
    HTML->>JS: Load script.js with defer
    HTML->>DOM: Load style.css
    JS->>JS: Cache DOM elements; define scoring, daylight and course helpers
    JS->>JS: requestBrowserLocation()
    JS->>Geo: getCurrentPosition()

    alt GPS location succeeds first
        Geo-->>JS: latitude, longitude
        JS->>JS: loadForecast(latitude, longitude, "Your current location")
        JS->>DOM: Show coordinates, location status, busy state
        JS->>WeatherAPI: GET current weather + sunrise/sunset for GPS coordinates
        WeatherAPI-->>JS: Forecast JSON
        JS->>JS: validateCurrentWeather(payload)
        JS->>JS: parseLocalDateTime() and normalize weather model
        JS->>JS: renderForecast(weather)
        JS->>JS: getScoreDetails()
        JS->>JS: getTemperatureScore(), getWindScore(), getRainScore()
        JS->>JS: getHumidityScore(), getCloudScore()
        JS->>JS: createExplanation() and getRecommendation()
        JS->>JS: getDaylightDetails()
        JS->>JS: Apply night/daylight and weather eligibility gate
        JS->>DOM: Render score, daylight summary and conditions
        alt Daytime, at least 30 minutes remaining, rating not Poor
            JS->>JS: loadNearbyCourses(latitude, longitude)
            JS->>JS: fetchNearbyCourses(latitude, longitude)
            JS->>Maps: Add/load Maps JavaScript API if importLibrary is absent
            Maps-->>JS: Maps API initialized
            JS->>Maps: importLibrary("places")
            Maps-->>JS: Place and rank preference
            JS->>Places: Place.searchNearby(fields, locationRestriction, golf_course, rank)
            Places-->>JS: Nearby place records
            JS->>JS: Validate place fields
            JS->>JS: calculateDistanceMiles() for each result
            JS->>JS: Filter radius, sort nearest-first, limit to 5
            JS->>JS: renderCourses(courses)
            JS->>DOM: Render name, address, distance and Maps link
        else Not playable by daylight/weather gate
            JS->>DOM: Hide and clear nearby-course panel
        end
        JS->>DOM: Clear busy state; mark forecast ready
    else GPS unavailable, denied, fails, or times out
        Geo-->>JS: Geolocation error
        JS->>DOM: Show location-specific guidance and ZIP option
    end

    opt User enters a ZIP code
        User->>DOM: Submit ZIP form
        DOM->>JS: Submit event
        JS->>JS: Validate ZIP format; set manual-location flag
        alt ZIP invalid
            JS->>DOM: Show validation error and focus ZIP field
        else ZIP valid
            JS->>GeoAPI: GET search by ZIP/name
            GeoAPI-->>JS: Candidate locations
            JS->>JS: findZipLocation(): select US result matching postcode
            alt Matching ZIP and coordinates found
                JS->>JS: loadForecast(latitude, longitude, "City, State")
                JS->>WeatherAPI: GET current weather + sunrise/sunset for ZIP coordinates
                WeatherAPI-->>JS: Forecast JSON
                JS->>JS: Validate/normalize; score and daylight evaluation
                JS->>DOM: Render ZIP location, score, recommendation and conditions
                alt Course eligibility gate passes
                    JS->>JS: loadNearbyCourses() → fetchNearbyCourses()
                    JS->>Places: Place.searchNearby() at ZIP coordinates
                    Places-->>JS: Nearby place records or error
                    alt Results returned
                        JS->>JS: Validate, measure, sort and limit results
                        JS->>DOM: Render nearest courses and Maps links
                    else No matching courses
                        JS->>DOM: Show "No nearby golf courses found."
                    else Places request/library failure
                        JS->>JS: Log error
                        JS->>DOM: Show "Unable to retrieve nearby golf courses."
                    end
                else Course eligibility gate fails
                    JS->>DOM: Hide and clear nearby-course panel
                end
            else ZIP lookup fails
                JS->>DOM: Show location lookup error
            end
        end
    end
```
