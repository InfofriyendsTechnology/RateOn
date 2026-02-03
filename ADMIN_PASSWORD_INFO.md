# Super Admin Login Password

## Password Formula
The super admin password changes daily based on the current date.

**Formula:** `D` + `M` + `YYYY` + `9325` (NO zero padding)

## Examples
- **February 3, 2026** → `3` + `2` + `2026` + `9325` = `322269325`
- **February 1, 2026** → `1` + `2` + `2026` + `9325` = `122269325`
- **December 25, 2026** → `25` + `12` + `2026` + `9325` = `251220269325`
- **January 1, 2027** → `1` + `1` + `2027` + `9325` = `1120279325`

## How to Access
1. Go to the landing page (homepage)
2. Scroll to the footer
3. Click on the RateOn logo in the footer
4. You will be redirected to `/admin/login`
5. Enter today's password using the formula above
6. You will be automatically logged in and redirected to the admin dashboard

## Password Format Details
- Total length: **9 to 12 digits** (varies based on date)
- Format: `D` or `DD` + `M` or `MM` + `YYYY` + `9325`
- D/DD = Day (NO zero padding, e.g., 1, 5, 15, 31)
- M/MM = Month (NO zero padding, e.g., 1, 6, 12)
- YYYY = Year (4 digits, e.g., 2026)
- Fixed suffix: `9325`

## Security Notes
- Password validation happens on the **backend** (not frontend)
- The backend compares the entered password with today's date
- Only exact matches are accepted
- No password is stored in the database
- Admin email is fixed as `admin@rateon.com`

## Implementation Files
- **Backend:** `backend/src/controllers/adminController/adminLogin.js`
- **Frontend:** `frontend/src/app/features/admin/login/admin-login.component.ts`
- **Route:** `frontend/src/app/app.routes.ts`
