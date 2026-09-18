# SHAYAN-AI

SHAYAN AI is a modern, dark-themed AI assistant interface designed for Android packaging with Capacitor.

## Features
- Responsive layout for mobile and desktop
- Dark blue/purple visual theme
- Ready for Android app wrapping via Capacitor
- App ID set to `com.shayan.ai`

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

## Android release

Use Android Studio to build an APK or AAB from the generated Android project.
