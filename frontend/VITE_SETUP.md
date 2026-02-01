# Angular + Vite - Clean Setup

## ✅ What You Have

**Pure Angular 19 with Vite** - No extras, just fast development.

```json
Builder: @angular/build:application  (Uses Vite + esbuild)
Port: 5300
HMR: Enabled
```

---

## 🚀 Commands

### Development
```bash
npm run dev
```
Starts dev server on `http://localhost:5300`

### Production Build
```bash
npm run build
```
Builds to `dist/` folder

### Preview Production
```bash
npm run preview
```
Preview production build locally

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/           # Your components
│   ├── main.ts        # Entry point
│   └── styles.scss    # Global styles
├── public/            # Static assets
├── angular.json       # Angular + Vite config
├── tsconfig.json      # TypeScript config
└── package.json       # Dependencies
```

---

## ⚡ How It Works

**Angular 19 uses Vite internally:**

1. **Development:** `@angular/build:dev-server` → Vite dev server
2. **Production:** `@angular/build:application` → Vite + esbuild bundler
3. **HMR:** Enabled by default - instant updates

**No webpack. No extra config. Just Vite.**

---

## 🎯 Performance

- Dev server starts in **2-3 seconds**
- HMR updates in **100-200ms**
- Production build in **30-60 seconds**

**Same speed as React + Vite!**

---

## 🔧 Configuration

All config is in `angular.json`:

```json
{
  "builder": "@angular/build:application",  // Vite
  "options": {
    "hmr": true,                           // Hot reload
    "port": 5300,                          // Dev port
    "assets": [{
      "glob": "**/*",
      "input": "public",
      "output": "/"
    }]
  }
}
```

**Clean and simple.**

---

## ✨ That's It!

Just run:
```bash
npm run dev
```

And start coding! 🚀
