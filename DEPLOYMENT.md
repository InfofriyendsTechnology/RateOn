# Deployment Guide

## 🚀 GitHub Setup

### 1. Initialize Git Repository

```bash
cd C:\Users\dell i7\Desktop\project\RateOn
git init
git add .
git commit -m "Initial commit: RateOn monorepo setup"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `write-on`
3. Description: "RateOn - Item-Level Review Platform"
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### 3. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/write-on.git
git branch -M main
git push -u origin main
```

---

## 🌐 Production Deployment

### Backend Deployment (Option 1: Render/Railway/Heroku)

#### Using Render.com (Free tier):

1. **Create New Web Service**
   - Connect your GitHub repository
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && node src/server.js`
   - Environment: Node

2. **Environment Variables**
   Set these in Render dashboard:
   ```
   PORT=10000
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_production_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

3. **Get Deployment URL**
   - Example: `https://write-on-backend.onrender.com`

#### Using Railway.app:

1. Import from GitHub
2. Select `backend` as root directory
3. Add environment variables
4. Deploy automatically

---

### Frontend Deployment (Vercel/Netlify)

#### Using Vercel (Recommended):

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to https://vercel.com/new
   - Import your GitHub repository `write-on`
   - Framework Preset: **Angular**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist/frontend/browser`
   - Install Command: `npm install`

3. **Environment Variables**:
   Add in Vercel dashboard:
   ```
   PRODUCTION=true
   ```

4. **Update Production Environment**:
   Edit `frontend/src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://write-on-backend.onrender.com/api/v1',  // Your backend URL
     appName: 'RateOn',
     tokenKey: 'rateon_token',
     userKey: 'rateon_user',
     googleClientId: 'YOUR_GOOGLE_CLIENT_ID'
   };
   ```

5. **Commit and Redeploy**:
   ```bash
   git add .
   git commit -m "Update production API URL"
   git push
   ```

---

### Database (MongoDB Atlas)

1. **Create Free Cluster**:
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free M0 cluster
   - Add database user
   - Whitelist IP: `0.0.0.0/0` (allow from anywhere)

2. **Get Connection String**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/rateon
   ```

3. **Add to Backend Environment Variables**

---

## 🔧 Local vs Production

### Development (Local)
```bash
npm run dev
```
- Backend: `http://localhost:1126`
- Frontend: `http://localhost:5300`
- Frontend uses `environment.ts` → connects to `localhost:1126`

### Production
```bash
npm start
```
- Backend: Deployed URL (e.g., `https://write-on-backend.onrender.com`)
- Frontend: Deployed URL (e.g., `https://write-on.vercel.app`)
- Frontend uses `environment.prod.ts` → connects to deployed backend

---

## ✅ Deployment Checklist

### Before Deploying:

- [ ] Create `.env` from `.env.example` with real values
- [ ] Test locally with `npm run dev`
- [ ] Update `environment.prod.ts` with production API URL
- [ ] Set up MongoDB Atlas
- [ ] Get Cloudinary credentials
- [ ] Configure Google OAuth (add production URLs)
- [ ] Add all environment variables to hosting platforms

### After Deploying:

- [ ] Test backend API endpoints
- [ ] Test frontend loads correctly
- [ ] Verify frontend → backend communication
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Check database connections
- [ ] Monitor logs for errors

---

## 🐛 Troubleshooting

### CORS Errors:
- Ensure `FRONTEND_URL` in backend `.env` matches frontend deployment URL
- Check CORS configuration in `backend/src/server.js`

### API Connection Failed:
- Verify `environment.prod.ts` has correct backend URL
- Check backend deployment logs
- Ensure backend is running

### MongoDB Connection Failed:
- Check `MONGODB_URI` is correct
- Verify IP whitelist in MongoDB Atlas
- Check database user credentials

### Build Failures:
- Clear node_modules and reinstall: `npm run install:all`
- Check Node.js version compatibility
- Review build logs for specific errors

---

## 📝 Commands Summary

```bash
# Development
npm run dev              # Run both backend and frontend locally

# Production
npm start                # Run both in production mode

# Build
npm run build            # Build both backend and frontend

# Install
npm run install:all      # Install all dependencies

# Individual
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
```

---

## 🎯 Recommended Stack

- **Backend**: Render.com (Free tier)
- **Frontend**: Vercel (Free tier)
- **Database**: MongoDB Atlas (Free tier)
- **Storage**: Cloudinary (Free tier)
- **Source Control**: GitHub

**Total Cost: $0/month** (Free tier)

---

**Need help?** Check the main README.md or backend/frontend README files.
