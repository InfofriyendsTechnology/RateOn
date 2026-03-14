# PARTHAVI NI VIVA NOTEBOOK - RateOn Project

> Exam time reference - RateOn Final Year Project

---

# 1. WEB APPLICATION SHU HOY CHHE?

Web application na 3 parts hoy chhe:
- **Frontend** = Jo user browser ma jue chhe (buttons, pages, forms)
- **Backend** = Server par chaltu engine (logic, database, rules)
- **Database** = Data permanently store thay chhe

Real life example:
- Frontend = Restaurant nu menu (tame juo chho)
- Backend = Kitchen (andar kaam thay chhe)
- Database = Fridge (saaman store chhe)

---

# 2. FRONTEND SHU CHHE?

Frontend = Browser ma jo dikhay te badhu.
RateOn ma Angular 19 use karyu chhe.

## Angular shu chhe?
- Google e banavel JavaScript Framework chhe
- Component-based chhe - drek page ek alag component
- TypeScript ma lakhay chhe

## Angular na parts:
- **Component** = Ek page ya ek UI piece (navbar, review-card)
- **Service** = API calls karva mate (ReviewService, AuthService)
- **Guard** = Route protect kare (login vina page na khule)
- **Interceptor** = Har HTTP request ma auto JWT token lagave
- **Routes** = Konsa URL par konsu page khule te

## RateOn Frontend Folder Structure:
- features/auth = Login, Register pages
- features/business = Business list, detail pages
- features/review = Review likhva nu page
- features/user = Profile, dashboard
- features/admin = Admin analytics
- shared/navbar = Top navigation bar
- shared/auth-modal = Login popup jyare review submit karo
- shared/rating-stars = Star rating component
- shared/skeleton-loader = Loading placeholder
- shared/toast = Notification popup

---

# 3. BACKEND SHU CHHE?

Backend = Server par chaltu code.
RateOn ma Node.js + Express.js use karyu chhe.

## Node.js shu chhe?
- JavaScript ne browser bahar server par chalava de
- Non-blocking I/O = ek sath multiple requests handle kare
- Fast performance

## Express.js shu chhe?
- Node.js mate lightweight framework
- Routes banava easy bane
- Middleware lagava easy bane

## server.js ma shu thay chhe?
1. Express app banavo
2. HTTP server banavo (Socket.io mate createServer)
3. CORS configure karo (Angular ne allow karo)
4. Middleware lagavo (JSON parser, cookie parser, session)
5. Passport (Google OAuth) initialize karo
6. Routes attach karo (/api/v1/)
7. MongoDB connect karo
8. WebSocket (Socket.io) start karo
9. Server PORT 1126 par listen karo

---

# 6. JWT AUTHENTICATION SHU CHHE?

JWT = JSON Web Token. Login system mate use thay chhe.

## Kaam kaise kare chhe?
1. User login kare (email + password)
2. Server verify kare
3. Server JWT token banave (userId + role + expiry time)
4. Token frontend ne bhave
5. Frontend localStorage ma save kare
6. Har next request ma: Authorization: Bearer <token>
7. Server verify kare - access de

## JWT ma 3 parts hoy chhe:
- Header: algorithm info (base64)
- Payload: userId, role, expiry time (base64)
- Signature: secret key thi sign (tamper-proof)

## JWT ni khasiyat:
- Stateless: server par session store nahi karvu padu
- Scalable: multiple servers par kaam kare
- Self-contained: token ma j badhu chhe

## auth.js middleware shu kare?
- Token Authorization header thi nikale
- jwt.verify() thi check kare
- User info req.user ma attach kare
- next() call kare - aage jay

---

# 7. GOOGLE OAUTH SHU CHHE?

OAuth = Open Authorization
User password vina Google account thi login kari shake.

## Flow step by step:
1. User Login with Google click kare
2. Google login page khule
3. User Google ma login kare
4. Google confirm kare - hamara server ne profile data bhave
5. Server 3 cases check kare:
   Case 1: Google ID thi user milyo = existing user login
   Case 2: Same email chhe = Google ID link karo
   Case 3: Navo user = new account banavo
6. JWT token banave
7. User logged in!

## Passport.js shu chhe?
- Node.js mate authentication middleware
- Multiple strategies support: Google, Facebook, GitHub
- serializeUser = session ma user ID save karo
- deserializeUser = session thi user fetch karo

---

# 8. BCRYPT - PASSWORD SECURITY SHU CHHE?

Bcrypt = Password hashing algorithm

## Kyun zaruri chhe?
- Password directly database ma store karva dangerous
- Database hack thay to passwords expose thay
- Bcrypt se hashed version store thay - original password koi na jane

## Kaam kaise kare chhe?
- Password + Salt = Hash (one-way - reverse nahi thay)
- Salt = random string je har password unique banave
- Salt rounds = 10 means 2^10 = 1024 times process

## RateOn ma:
- UserModel ma pre save hook chhe
- Save thay te pehla automatically bcrypt.hash(password, 10) run thay
- Login time: bcrypt.compare(input, hash) = match check

---

# 9. ROLE-BASED AUTHORIZATION SHU CHHE?

Roles = User ne alag alag permissions apava.

## RateOn ma 3 Roles:
1. user = Normal user - reviews lakhay, follow kare
2. business_owner = Business ane items manage kare, reviews par reply kare
3. admin = Super admin - badhu jue, analytics jue

## authorize.js middleware:
- Kon kon sa roles access kari shake te specify karo
- Example: authorize([business_owner]) = sirf owner j access kari shake
- Role JWT token ma ane database ma both compare thay

## Become Business Owner:
- Koi pan normal user one-click thi business owner bani shake
- POST /api/v1/user/become-business-owner
- Role user thi business_owner thay jaay
- Alag registration ni jarur nahi - unified system

---

# 10. WEBSOCKET / SOCKET.IO SHU CHHE?

WebSocket = Real-time bidirectional communication

## HTTP vs WebSocket:
- HTTP: Client puchhe tabhi server bole (one-way, temporary)
- WebSocket: Persistent connection - server kabhi pan data bhavi shake (real-time!)

## RateOn ma kaam kaise kare:
1. User login kare - Socket connection open thay
2. User apna personal room ma join thay: user:{userId}
3. Koi review kare ya follow kare to server notification bhave
4. emitNotificationToUser() function call thay
5. Frontend instantly notification receive kare

## notificationSocket.js:
- initializeSocket() = Socket.io server start karo
- connectedUsers Map = kon connected chhe te track karo
- emitNotificationToUser() = specific user ne message bhavo

---

# 11. CLOUDINARY SHU CHHE?

Cloudinary = Cloud-based image hosting service

## Kyun use karyu?
- Hamara server par images store karva dangerous (storage full thay)
- Cloudinary CDN provide kare = fast loading worldwide
- Auto WebP conversion = images lightweight bane

## Flow:
1. User image upload kare
2. Backend Cloudinary API ne image bhave
3. Cloudinary image store kare, URL return kare
4. Database ma URL save thay
5. Frontend URL thi image show kare

---

# 12. CORS SHU CHHE?

CORS = Cross-Origin Resource Sharing
Browser security feature je different domain thi API calls block kare.

## RateOn ma:
- Angular localhost:5300 thi Backend localhost:1126 par call kare
- server.js ma explicitly allow karyu chhe
- credentials: true = cookies bhavi shake

---

# 13. DATABASE MODELS - 14 MODELS

1. UserModel = Users (name, email, password, role, trustScore, level)
2. BusinessModel = Businesses (name, location, owner, rating, hours)
3. ItemModel = Items (name, price, availability status, review stats)
4. ReviewModel = Reviews (rating, comment, isPermanent=true)
5. ReactionModel = Helpful/Not helpful on reviews
6. ReplyModel = Comments on reviews
7. FollowModel = User A follows User B
8. NotificationModel = User notifications
9. ActivityLogModel = User activity tracking
10. CategoryModel = Business categories
11. ReportModel = Abuse/spam reports
12. AdminModel = Admin users
13. roleModel = Role definitions

## Important UserModel fields:
- role: user / business_owner / admin
- trustScore: 0-100 (gamification)
- level: 1-10
- googleId: Google OAuth ID
- registrationMethod: email / google
- pre save hook: auto password hashing

## Important ReviewModel fields:
- itemId: Kon sa item nu review chhe
- businessId: Kon sa business nu
- reviewType: item ya business
- isPermanent: true = business owner delete nahi kar shakay!
- Unique index: ek user ek item par ek j active review

## Important ItemModel fields:
- availability.status: available / out_of_stock / coming_soon
- stats.averageRating: auto calculate from distribution
- updateRating() method: rating add/remove par auto recalculate

---

# 14. TRUST SCORE SYSTEM
Base: 50 points. +3 per review (max 30). +1 per reaction (max 20). Total max: 100
Level 1-10. Score 80+ = trusted_reviewer badge. Level 5+ = top_contributor badge
Kyun: Fake reviews rokva, quality reviewers ne reward karva

---

# 15. MONGODB INDEXES SHU CHHE?
Index = Database searching fast karva mate
Vina Index = full scan (slow). Index sate = direct jump (fast)
trustScore: -1 index = top users jaldi milya
2dsphere index = nearby businesses geospatial search
text index = name/description full text search
Compound index: userId+itemId = ek user ek item par ek j review enforce

---

# 16. SUPER ADMIN SYSTEM
Dynamic Password Formula: Day + Month + YYYY + 9325
March 11 2026 = 11 + 3 + 2026 + 9325 = 11320269325
Email: admin@rateon.com | URL: /admin/login
Kyun dynamic? Daily change, no database lookup, extra fast and secure

---

# 17. GEOSPATIAL FEATURE
Business ma longitude/latitude store chhe
2dsphere index thi nearby businesses dhundva milya
MongoDB na dollar-near operator use thay chhe

---

# 18. VIVA QUESTIONS ANE ANSWERS

Q: Project shu chhe?
A: RateOn ek item-level review platform chhe. Google Reviews ma sirf business ne rate kari shake, pan RateOn ma specific item ne rate kari shake - jeva ke Vadapav ne alag 5 star de.

Q: MongoDB kyun? MySQL kyun nahi?
A: Reviews no structure flexible chhe. MongoDB no flexible schema better chhe. Plus geospatial queries 2dsphere index thi built-in chhe.

Q: JWT shu chhe?
A: JSON Web Token. Login karta server ek encrypted token banave jema userId role ane expiry chhe. Har request ma token bhave, server verify kare. Database query ni jarur nahi.

Q: Google OAuth shu chhe?
A: User Google account thi login kare. Google confirm kare, server profile data le, JWT banave. 3 cases: existing user, link email, new user.

Q: Bcrypt kyun?
A: Password direct store dangerous. Bcrypt one-way hash banave. Database hack thay to bhi original password koi na jane. Salt rounds 10 = brute force mushkil.

Q: WebSocket vs HTTP?
A: HTTP = request-response one-time. WebSocket = persistent connection, server kabhi pan data bhavi shake. Isliye real-time notifications mate Socket.io use karyu.

Q: isPermanent: true review ma kyun?
A: Key innovation! Business owner negative review delete na kari shake. Sirf reply kari shake. Platform ni trustworthiness badhe.

Q: CORS shu chhe?
A: Browser security feature je different domain thi API calls block kare. Angular localhost:5300 thi Backend localhost:1126 par call kare isliye allow karyu.

Q: Cloudinary kyun?
A: Images server par store dangerous. Cloudinary CDN thi fast loading, auto WebP compression, URL thi easy access.

Q: Trust Score shu chhe?
A: User reliability measure kare. Base 50 + reviews max 30 + reactions max 20 = 100. Fake reviewers ne discourage kare.

Q: Become Business Owner kaise?
A: One click thi. POST /api/v1/user/become-business-owner. Role user thi business_owner thay. Alag registration nahi.

Q: Dynamic admin password kyun?
A: Daily change thay, extra security, no database lookup needed.

Q: Index shu chhe?
A: Database search fast karva. Vina index = full scan slow. Index sate = direct jump fast.

---

# 19. PROJECT STATS
Backend APIs: 58+ | Models: 14 | Routes: 15
Frontend Components: 30+ | Services: 10+
Backend Port: 1126 | Frontend Port: 5300

---

# 20. TECH SUMMARY
Angular 19 = Frontend | Node.js = Server runtime | Express.js = Backend framework
MongoDB = Database | Mongoose = MongoDB library | JWT = Auth token
Passport.js = Google OAuth | Socket.io = Real-time | Cloudinary = Images
bcrypt = Password hashing | CORS = Cross-origin security

---
ALL THE BEST PARTHAVI! Tu badhu explain kari shakis!