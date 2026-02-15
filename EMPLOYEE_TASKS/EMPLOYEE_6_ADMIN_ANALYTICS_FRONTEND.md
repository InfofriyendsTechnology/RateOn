# EMPLOYEE 6: ADMIN ANALYTICS FRONTEND
**Duration:** 2 weeks (Start AFTER Employee 5 completes)
**Status:** NOT STARTED

## YOUR RESPONSIBILITY
Build complete admin dashboard with charts, statistics, maps, and real-time metrics visualization.

---

## PROJECT STANDARDS - MUST FOLLOW
Follow existing frontend structure exactly. Test in browser after each component. If errors occur, try solving (3 attempts), then ask senior. Never commit broken code.

---

## FILES TO CREATE

### Frontend (10 files)
1. `frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.ts`
2. `frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.html`
3. `frontend/src/app/features/admin/admin-dashboard/admin-dashboard.component.scss`
4. `frontend/src/app/shared/components/stat-card/stat-card.component.ts` (Reusable)
5. `frontend/src/app/shared/components/user-map/user-map.component.ts` (Leaflet map)
6. `frontend/src/app/shared/components/analytics-charts/analytics-charts.component.ts`
7. `frontend/src/app/shared/components/top-businesses/top-businesses.component.ts`
8. `frontend/src/app/core/services/admin-analytics.service.ts`
9. `frontend/src/app/core/guards/admin.guard.ts` (Route protection)
10. Update routing module

---

## LIBRARIES TO USE

```bash
npm install chart.js ng2-charts leaflet @types/leaflet
```

- **Chart.js**: Bar charts, pie charts, line charts
- **Leaflet.js**: Interactive map with user location markers

---

## DASHBOARD LAYOUT

```
+----------------------------------+
|   ADMIN DASHBOARD                |
+----------------------------------+
| [Total Users] [Total Reviews]    |
| [Avg Rating]  [Active Now]       | <- Stat Cards
+----------------------------------+
| Registration Methods (Pie Chart) |
| Gender Distribution (Bar Chart)  |
+----------------------------------+
| Top 10 Countries (Bar Chart)     |
+----------------------------------+
| User Locations Map (Leaflet)     |
+----------------------------------+
| Top Businesses (Week/Month)      |
| Table with sorting               |
+----------------------------------+
```

---

## TECHNICAL REQUIREMENTS

### CRITICAL: FOLLOW FRONTEND STRUCTURE EXACTLY

**BEFORE WRITING ANY CODE:**

**1. Admin Analytics Service**
- Open existing services in `frontend/src/app/core/services/`
- Study their structure line-by-line:
  - How they import HttpClient
  - How they define baseUrl
  - How they structure HTTP methods
  - How they handle errors
  - How they type responses (interfaces? any?)
  - Injectable decorator usage

- **COPY EXACT STRUCTURE** from existing services
- Use project's API response typing conventions
- Use project's error handling pattern

**2. Admin Dashboard Component**
- Study existing feature components in `frontend/src/app/features/`
- Copy their structure:
  - Component decorator format
  - Lifecycle hooks usage
  - Service injection pattern
  - Observable subscription pattern
  - Property typing
  - Method naming conventions

**3. Reusable Components (Map, Charts, Cards)**
- Study `frontend/src/app/shared/components/`
- Match their structure 100%:
  - Input/Output decorators
  - Typing conventions
  - Template structure
  - SCSS organization
  - Lifecycle hooks

**4. Chart.js & Leaflet Integration**
- Look for existing chart usage in project
- If none exists, study Angular component structure and adapt
- Follow project's library integration patterns
- Use project's CSS/SCSS conventions

**5. Admin Guard**
- Study existing guards in `frontend/src/app/core/guards/`
- Copy their EXACT structure
- Use project's auth service pattern
- Use project's role-checking method

**KEY LOGIC:**
- Load all data on dashboard init
- Display in cards, charts, map, tables
- Toggle week/month for top businesses
- Admin-only access via route guard

**STRUCTURE:** Your components must be identical in structure to existing ones

---

## TESTING CHECKLIST

- [ ] Admin guard blocks non-admin users
- [ ] Dashboard loads all data on mount
- [ ] Stat cards display correctly
- [ ] Charts render with correct data
- [ ] Map displays user location markers
- [ ] Top businesses table sorts correctly
- [ ] Week/Month toggle works
- [ ] Real-time metrics update
- [ ] Responsive design works on mobile

---

## INTEGRATION

**You use:**
- Employee 5's analytics APIs

**Dependencies:**
- Wait for Employee 5 to complete backend APIs

---

## DEADLINE & MILESTONES

- **Day 3**: Service + Admin Guard complete
- **Day 7**: Dashboard layout with stat cards
- **Day 10**: Charts and map integrated
- **Day 14**: Top businesses table, polish UI

---

## START HERE
1. Wait for Employee 5 to complete APIs
2. Create admin-analytics.service.ts
3. Create admin.guard.ts (check super_admin role)
4. Build dashboard component
5. Add stat cards
6. Integrate Chart.js for charts
7. Integrate Leaflet.js for map
8. Test with real data