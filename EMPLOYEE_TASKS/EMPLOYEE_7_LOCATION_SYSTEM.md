# EMPLOYEE 7: LOCATION SYSTEM
**Duration:** 2 weeks
**Status:** NOT STARTED

## YOUR RESPONSIBILITY
Build cascading location selectors (Country→State→City) with IP-based auto-detection and Google Places autocomplete.

---

## PROJECT STANDARDS - MUST FOLLOW
Follow existing backend/frontend structure exactly. Test after each file creation. If errors occur, try solving (3 attempts), then ask senior. Never commit broken code.

---

## FILES TO CREATE

### Backend (8 files)
1. `backend/src/controllers/location/getCountries.js`
2. `backend/src/controllers/location/getStatesByCountry.js`
3. `backend/src/controllers/location/getCitiesByState.js`
4. `backend/src/controllers/location/detectLocationFromIP.js`
5. `backend/src/controllers/location/index.js`
6. `backend/src/routes/locationRoutes.js`
7. `backend/src/utils/ipGeolocation.js` (Helper for IP detection)
8. Update `backend/src/routes/index.js`

### Frontend (4 files)
9. `frontend/src/app/core/services/location.service.ts`
10. `frontend/src/app/shared/components/location-selector/location-selector.component.ts`
11. `frontend/src/app/shared/components/location-selector/location-selector.component.html`
12. `frontend/src/app/shared/components/location-selector/location-selector.component.scss`
13. `frontend/src/app/shared/components/address-autocomplete/address-autocomplete.component.ts`

---

## API ENDPOINTS

```
GET  /api/locations/countries              - Get all countries
GET  /api/locations/states?country=USA     - Get states by country
GET  /api/locations/cities?state=CA        - Get cities by state
POST /api/locations/detect-ip              - Detect location from IP
```

---

## TECHNICAL REQUIREMENTS

### Backend Requirements:

**1. IP Geolocation (Auto-detect)**
- Use free API: **ipapi.co** (1000 req/day) or **ip-api.com** (45 req/min)
- Create utility in `backend/src/utils/ipGeolocation.js`
- **MUST follow project's utility file structure** (check other utils)
- Use project's HTTP client pattern (axios? fetch? check existing code)
- Use project's error handling pattern

**2. Country/State/City Data**
- Install: `npm install country-state-city`
- Use `Country`, `State`, `City` from this library
- **Backend controllers MUST match existing controller structure**
- Study `backend/src/controllers/review/` for patterns
- Use project's response handler if it exists

**3. Controller Structure**
- Open existing controllers first
- Copy their exact structure
- Do NOT use generic `res.status().json()` if project has helpers
- Follow project's import conventions
- Follow project's export pattern

---

### Frontend Requirements:

**1. Google Places Autocomplete**
- Study existing Angular components in `frontend/src/app/shared/components/`
- Follow EXACT component structure used in project
- Use project's typing conventions
- Follow project's template patterns
- Use project's SCSS structure

**2. Cascading Location Selector**
- Study existing form components
- Copy their structure exactly
- Use project's form handling approach (reactive? template-driven?)
- Follow project's service injection pattern
- Use project's Observable handling pattern

**3. Location Service**
- Study existing services in `frontend/src/app/core/services/`
- Match their structure 100%
- Use same HTTP methods pattern
- Use same error handling
- Use same typing conventions

**KEY LOGIC:**
- Cascading: Country change → load states → clear city
- State change → load cities
- Auto-detect on component init
- Pre-fill form with detected location

**STRUCTURE:** Must be indistinguishable from existing components/services

---

## TESTING CHECKLIST

- [ ] Get countries API works
- [ ] Get states API works (filtered by country)
- [ ] Get cities API works (filtered by state)
- [ ] IP detection works and returns correct location
- [ ] Cascading selectors update correctly
- [ ] Google Places autocomplete works
- [ ] Auto-detection pre-fills form on page load
- [ ] Coordinates saved to User model

---

## INTEGRATION

**You provide:**
- Location APIs for registration/profile forms
- Location selector component (reusable)
- Auto-detection utility

**Used by:**
- Registration form (auto-detect user location)
- Profile edit form
- Business registration
- Employee 5 (location data for admin map)

---

## DEADLINE & MILESTONES

- **Day 3**: Backend APIs (countries, states, cities)
- **Day 7**: IP detection implementation
- **Day 10**: Cascading selector component
- **Day 14**: Google Places autocomplete integration

---

## START HERE
1. Install `country-state-city` package
2. Create getCountries.js API
3. Create getStates/getCities APIs
4. Test APIs with Postman
5. Implement IP detection utility
6. Build frontend location-selector component
7. Add Google Places autocomplete
8. Test cascading behavior