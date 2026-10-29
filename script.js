(() => {
    "use strict";

    const API_BASE_URL = "https://api.open-meteo.com/v1/forecast";
    const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";

    const elements = {
        locationHeading: document.querySelector("#location-heading"),
        locationStatus: document.querySelector("#location-status"),
        coordinates: document.querySelector("#coordinates"),
        zipForm: document.querySelector("#zip-form"),
        zipCode: document.querySelector("#zip-code"),
        zipButton: document.querySelector("#zip-form button"),
        forecast: document.querySelector("#forecast"),
        errorMessage: document.querySelector("#error-message"),
        scoreValue: document.querySelector("#score-value"),
        scoreRating: document.querySelector("#score-label"),
        scoreProgress: document.querySelector("#score-progress"),
        scoreBar: document.querySelector("#score-bar"),
        recommendation: document.querySelector("#recommendation"),
        playabilityGuidance: document.querySelector("#playability-guidance"),
        sunriseTime: document.querySelector("#sunrise-time"),
        sunsetTime: document.querySelector("#sunset-time"),
        remainingDaylight: document.querySelector("#remaining-daylight"),
        daylightSummary: document.querySelector("#daylight-summary"),
        scoreExplanation: document.querySelector("#score-explanation"),
        temperature: document.querySelector("#temperature"),
        feelsLike: document.querySelector("#feels-like"),
        windSpeed: document.querySelector("#wind-speed"),
        condition: document.querySelector("#condition"),
        conditionIcon: document.querySelector("#condition-icon"),
        precipitationDetail: document.querySelector("#precipitation-detail"),
        weatherUpdated: document.querySelector("#weather-updated")
    };

    const weatherDescriptions = {
        0: { label: "Clear sky", icon: "☀" },
        1: { label: "Mainly clear", icon: "🌤" },
        2: { label: "Partly cloudy", icon: "⛅" },
        3: { label: "Overcast", icon: "☁" },
        45: { label: "Fog", icon: "≋" },
        48: { label: "Icy fog", icon: "≋" },
        51: { label: "Light drizzle", icon: "🌦" },
        53: { label: "Drizzle", icon: "🌦" },
        55: { label: "Heavy drizzle", icon: "🌧" },
        56: { label: "Freezing drizzle", icon: "🌧" },
        57: { label: "Heavy freezing drizzle", icon: "🌧" },
        61: { label: "Light rain", icon: "🌧" },
        63: { label: "Rain", icon: "🌧" },
        65: { label: "Heavy rain", icon: "🌧" },
        66: { label: "Freezing rain", icon: "🌧" },
        67: { label: "Heavy freezing rain", icon: "🌧" },
        71: { label: "Light snow", icon: "❄" },
        73: { label: "Snow", icon: "❄" },
        75: { label: "Heavy snow", icon: "❄" },
        77: { label: "Snow grains", icon: "❄" },
        80: { label: "Light rain showers", icon: "🌦" },
        81: { label: "Rain showers", icon: "🌧" },
        82: { label: "Heavy rain showers", icon: "🌧" },
        85: { label: "Snow showers", icon: "❄" },
        86: { label: "Heavy snow showers", icon: "❄" },
        95: { label: "Thunderstorm", icon: "⛈" },
        96: { label: "Thunderstorm with hail", icon: "⛈" },
        99: { label: "Severe thunderstorm with hail", icon: "⛈" }
    };

    const ratingByScore = [
        { minimum: 85, label: "Excellent" },
        { minimum: 70, label: "Good" },
        { minimum: 50, label: "Fair" },
        { minimum: 0, label: "Poor" }
    ];
    let hasManualLocationRequest = false;

    function showError(message) {
        elements.errorMessage.textContent = message;
        elements.errorMessage.hidden = false;
    }

    function clearError() {
        elements.errorMessage.textContent = "";
        elements.errorMessage.hidden = true;
    }

    function setBusy(isBusy) {
        elements.zipButton.disabled = isBusy;
        elements.zipCode.disabled = isBusy;
    }

    function formatCoordinate(value) {
        return Number(value).toFixed(4);
    }

    function getWeatherDescription(code) {
        return weatherDescriptions[code] || { label: "Conditions unavailable", icon: "•" };
    }

    function getTemperatureScore(temperature) {
        if (temperature >= 65 && temperature <= 80) return 100;
        if (temperature >= 58 && temperature < 65) return 85;
        if (temperature > 80 && temperature <= 88) return 80;
        if (temperature >= 48 && temperature < 58) return 65;
        if (temperature > 88 && temperature <= 95) return 55;
        if (temperature >= 38 && temperature < 48) return 40;
        return 20;
    }

    function getWindScore(windSpeed) {
        if (windSpeed <= 5) return 100;
        if (windSpeed <= 10) return 85;
        if (windSpeed <= 15) return 65;
        if (windSpeed <= 20) return 40;
        return 20;
    }

    function getRainScore(precipitation) {
        if (precipitation <= 0) return 100;
        if (precipitation <= 0.01) return 80;
        if (precipitation <= 0.1) return 50;
        return 15;
    }

    function getHumidityScore(humidity) {
        if (humidity <= 60) return 100;
        if (humidity <= 75) return 80;
        if (humidity <= 85) return 60;
        return 40;
    }

    function getCloudScore(cloudCover) {
        if (cloudCover <= 25) return 100;
        if (cloudCover <= 60) return 90;
        if (cloudCover <= 85) return 80;
        return 70;
    }

    function getScoreDetails(weather) {
        const { temperature, windSpeed, precipitation, humidity, cloudCover, weatherCode } = weather;
        // Weights reflect the requirements; thunderstorm conditions override the weighted score below.
        const weightedScore = Math.round(
            getTemperatureScore(temperature) * 0.30 +
            getWindScore(windSpeed) * 0.25 +
            getRainScore(precipitation) * 0.25 +
            getHumidityScore(humidity) * 0.10 +
            getCloudScore(cloudCover) * 0.10
        );
        const isThunderstorm = weatherCode >= 95 && weatherCode <= 99;
        const score = isThunderstorm ? Math.min(weightedScore, 20) : weightedScore;
        const rating = ratingByScore.find((item) => score >= item.minimum);

        return {
            score,
            rating: rating.label,
            explanation: createExplanation(weather, isThunderstorm),
            recommendation: getRecommendation(rating.label, isThunderstorm)
        };
    }

    function createExplanation(weather, isThunderstorm) {
        const positives = [];
        const concerns = [];
        const temperature = weather.temperature;
        const condition = getWeatherDescription(weather.weatherCode).label.toLowerCase();

        if (temperature >= 65 && temperature <= 80) {
            positives.push("temperatures are comfortable");
        } else if (temperature < 48) {
            concerns.push("it’s quite cold");
        } else if (temperature > 88) {
            concerns.push("it’s hot");
        } else if (temperature < 58) {
            concerns.push("it’s cool");
        } else {
            positives.push("temperatures are fairly comfortable");
        }

        if (weather.windSpeed <= 10) positives.push("winds are light");
        else if (weather.windSpeed > 20) concerns.push("strong winds may affect your game");
        else if (weather.windSpeed > 15) concerns.push("breezy conditions may affect your shots");
        else positives.push("winds are manageable");

        if (isThunderstorm) {
            concerns.push("thunderstorms are reported—avoid playing until conditions are safe");
        } else if (weather.precipitation > 0.1) {
            concerns.push("rain is currently falling");
        } else if (weather.precipitation > 0) {
            concerns.push("a little precipitation is reported");
        } else {
            positives.push("no precipitation is expected right now");
        }

        if (weather.humidity > 85) concerns.push("humidity is high");
        if (weather.cloudCover > 85 && weather.precipitation === 0) positives.push("the sky is mostly cloudy");

        const observations = [...positives, ...concerns];
        const explanation = observations.length
            ? `${capitalize(observations.join(", "))}.`
            : `Current conditions are ${condition}.`;

        return `${explanation} Forecast reflects conditions right now.`;
    }

    function getRecommendation(rating, isThunderstorm) {
        if (isThunderstorm) return "Poor conditions—please prioritize storm safety.";
        if (rating === "Excellent") return "Excellent conditions for golf.";
        if (rating === "Good") return "Good conditions for a round of golf.";
        if (rating === "Fair") return "Playable, but check the conditions before heading out.";
        return "Poor conditions for golf right now.";
    }

    function parseLocalDateTime(value) {
        if (typeof value !== "string") return null;

        const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2})?$/);
        if (!match) return null;

        const hour = Number(match[2]);
        const minute = Number(match[3]);
        if (hour > 23 || minute > 59) return null;

        return { date: match[1], minutes: hour * 60 + minute };
    }

    function formatDaylightDuration(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const parts = [];

        if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
        if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
        return parts.join(" and ");
    }

    function formatCompactDaylightDuration(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h`;
        return `${minutes}m`;
    }

    function formatLocalTime(value) {
        const parsed = parseLocalDateTime(value);
        if (!parsed) return "Unavailable";

        const hour = Math.floor(parsed.minutes / 60);
        const minute = parsed.minutes % 60;
        const period = hour < 12 ? "AM" : "PM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
    }

    function getDaylightDetails(weather) {
        const current = parseLocalDateTime(weather.time);
        const sunrise = parseLocalDateTime(weather.sunrise);
        const sunset = parseLocalDateTime(weather.sunset);
        const isAfterSunset = current.minutes > sunset.minutes;
        const daylightStart = Math.max(current.minutes, sunrise.minutes);
        const remainingMinutes = isAfterSunset
            ? 0
            : Math.max(0, sunset.minutes - daylightStart);

        let recommendation;
        let guidance = "";
        if (isAfterSunset) {
            recommendation = "🌙 Not Playable Today";
            guidance = "Try again tomorrow.";
        } else if (remainingMinutes < 30) {
            recommendation = "🌅 Insufficient Daylight";
            guidance = "Try again tomorrow.";
        } else if (remainingMinutes <= 60) {
            recommendation = "⚠ Limited Daylight Remaining";
            if (weather.rating === "Poor") {
                guidance = "Weather conditions are not favorable for golf right now.";
            }
        } else if (weather.rating === "Poor") {
            recommendation = "❌ Not Recommended";
            guidance = "Weather conditions are not favorable for golf right now.";
        } else if (remainingMinutes <= 120) {
            recommendation = "✅ Good For A Short Round";
        } else {
            recommendation = "✅ Excellent For Golf";
        }

        return {
            sunrise: weather.sunrise,
            sunset: weather.sunset,
            remainingMinutes,
            recommendation,
            guidance,
            summary: remainingMinutes > 0
                ? `You have approximately ${formatDaylightDuration(remainingMinutes)} of playable daylight remaining.`
                : "You have no playable daylight remaining today."
        };
    }

    function capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function validateCurrentWeather(payload) {
        const current = payload && payload.current;
        const daily = payload && payload.daily;
        const currentTime = current && parseLocalDateTime(current.time);
        const sunrise = daily && Array.isArray(daily.sunrise) && parseLocalDateTime(daily.sunrise[0]);
        const sunset = daily && Array.isArray(daily.sunset) && parseLocalDateTime(daily.sunset[0]);
        const requiredFields = [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "precipitation",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m"
        ];

        if (!current || requiredFields.some((field) => !Number.isFinite(current[field])) ||
            !currentTime || !sunrise || !sunset ||
            sunrise.date !== currentTime.date || sunset.date !== currentTime.date ||
            sunrise.minutes >= sunset.minutes) {
            throw new Error("Weather data was incomplete. Please try again.");
        }

        return {
            temperature: current.temperature_2m,
            feelsLike: current.apparent_temperature,
            humidity: current.relative_humidity_2m,
            precipitation: current.precipitation,
            weatherCode: current.weather_code,
            cloudCover: current.cloud_cover,
            windSpeed: current.wind_speed_10m,
            time: current.time,
            timezone: payload.timezone,
            sunrise: daily.sunrise[0],
            sunset: daily.sunset[0]
        };
    }

    async function fetchCurrentWeather(latitude, longitude) {
        const params = new URLSearchParams({
            latitude: String(latitude),
            longitude: String(longitude),
            current: [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "precipitation",
                "weather_code",
                "cloud_cover",
                "wind_speed_10m"
            ].join(","),
            daily: "sunrise,sunset",
            temperature_unit: "fahrenheit",
            wind_speed_unit: "mph",
            precipitation_unit: "inch",
            timezone: "auto"
        });
        const response = await fetch(`${API_BASE_URL}?${params}`);

        if (!response.ok) {
            throw new Error(`Weather service returned an error (${response.status}). Please try again.`);
        }

        return validateCurrentWeather(await response.json());
    }

    function renderForecast(weather) {
        const scoreDetails = getScoreDetails(weather);
        const daylightDetails = getDaylightDetails({ ...weather, rating: scoreDetails.rating });
        const condition = getWeatherDescription(weather.weatherCode);

        elements.scoreValue.textContent = String(scoreDetails.score);
        elements.scoreRating.textContent = scoreDetails.rating;
        elements.scoreProgress.setAttribute("aria-valuenow", String(scoreDetails.score));
        elements.scoreBar.style.width = `${scoreDetails.score}%`;
        elements.recommendation.textContent = daylightDetails.recommendation;
        elements.playabilityGuidance.textContent = daylightDetails.guidance;
        elements.sunriseTime.textContent = formatLocalTime(daylightDetails.sunrise);
        elements.sunsetTime.textContent = formatLocalTime(daylightDetails.sunset);
        elements.remainingDaylight.textContent = formatCompactDaylightDuration(daylightDetails.remainingMinutes);
        elements.daylightSummary.textContent = daylightDetails.summary;
        elements.scoreExplanation.textContent = scoreDetails.explanation;
        elements.temperature.textContent = String(Math.round(weather.temperature));
        elements.feelsLike.textContent = `Feels like ${Math.round(weather.feelsLike)}°F`;
        elements.windSpeed.textContent = String(Math.round(weather.windSpeed));
        elements.condition.textContent = condition.label;
        elements.conditionIcon.textContent = condition.icon;
        elements.precipitationDetail.textContent = weather.precipitation > 0
            ? `${weather.precipitation.toFixed(2)} in precipitation`
            : "No precipitation right now";
        elements.weatherUpdated.textContent = formatWeatherTime(weather.time);
        elements.forecast.hidden = false;
    }

    function formatWeatherTime(time) {
        if (!time) return "Updated just now";

        // Open-Meteo returns wall-clock time for the selected location, without an offset.
        const timeParts = time.match(/T(\d{2}):(\d{2})/);
        return timeParts ? `Local time ${timeParts[1]}:${timeParts[2]}` : "Updated just now";
    }

    async function loadForecast(latitude, longitude, locationName) {
        clearError();
        elements.forecast.hidden = true;
        elements.locationHeading.textContent = locationName || "Your local forecast";
        elements.locationStatus.textContent = "Getting current weather…";
        elements.coordinates.textContent = `${formatCoordinate(latitude)}, ${formatCoordinate(longitude)}`;
        elements.coordinates.hidden = false;
        setBusy(true);

        try {
            const weather = await fetchCurrentWeather(latitude, longitude);
            renderForecast(weather);
            elements.locationStatus.textContent = "Your local forecast is ready.";
        } catch (error) {
            console.error("Unable to load the forecast:", error);
            elements.locationStatus.textContent = "We couldn’t load your forecast.";
            showError(error instanceof Error
                ? error.message
                : "Something went wrong while loading the forecast. Please try again.");
        } finally {
            setBusy(false);
        }
    }

    function requestBrowserLocation() {
        if (!("geolocation" in navigator)) {
            elements.locationStatus.textContent = "Location is not available in this browser. Use a ZIP code below.";
            return;
        }

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                if (!hasManualLocationRequest) {
                    loadForecast(coords.latitude, coords.longitude, "Your current location");
                }
            },
            (error) => {
                if (hasManualLocationRequest) return;

                const messageByCode = {
                    1: "Location permission was denied. Enter a ZIP code below to get your forecast.",
                    2: "Your location could not be determined. Enter a ZIP code below instead.",
                    3: "Finding your location took too long. Enter a ZIP code below instead."
                };
                elements.locationStatus.textContent = messageByCode[error.code] || "Location is unavailable. Enter a ZIP code below.";
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
    }

    async function findZipLocation(zipCode) {
        const baseZipCode = zipCode.slice(0, 5);
        const params = new URLSearchParams({
            name: baseZipCode,
            count: "10",
            language: "en",
            format: "json"
        });
        const response = await fetch(`${GEOCODING_API_URL}?${params}`);

        if (!response.ok) {
            throw new Error(`Location service returned an error (${response.status}). Please try again.`);
        }

        const payload = await response.json();
        const results = Array.isArray(payload.results) ? payload.results : [];
        const location = results.find((result) =>
            result.country_code === "US" && result.postcodes?.includes(baseZipCode)
        );

        if (!location || !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
            throw new Error("We couldn’t find that ZIP code. Check it and try again.");
        }

        return {
            latitude: location.latitude,
            longitude: location.longitude,
            name: [location.name, location.admin1].filter(Boolean).join(", ")
        };
    }

    elements.zipForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const zipCode = elements.zipCode.value.trim();

        if (!/^\d{5}(?:-\d{4})?$/.test(zipCode)) {
            showError("Enter a valid 5-digit US ZIP code (or ZIP+4) to continue.");
            elements.zipCode.focus();
            return;
        }

        hasManualLocationRequest = true;
        clearError();
        elements.locationStatus.textContent = "Looking up your ZIP code…";
        setBusy(true);

        try {
            const location = await findZipLocation(zipCode);
            await loadForecast(location.latitude, location.longitude, location.name || `ZIP code ${zipCode}`);
        } catch (error) {
            console.error("Unable to look up the ZIP code:", error);
            elements.locationStatus.textContent = "We couldn’t find that location.";
            showError(error instanceof Error
                ? error.message
                : "Something went wrong while looking up that ZIP code. Please try again.");
            setBusy(false);
        }
    });

    requestBrowserLocation();
})();