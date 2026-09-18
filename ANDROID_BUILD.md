# SHAYAN AI — Android Build

This project is prepared to be wrapped as an Android app with Capacitor.

## Build

1. Install Node.js 18+ and Android Studio.
2. In this folder run:
   npm install
   npm run build
3. Add Android once:
   npx cap add android
4. Sync:
   npx cap sync android
5. Open Android Studio:
   npx cap open android
6. In Android Studio use Build > Generate App Bundle / APK > Generate APK.

Application ID: com.shayan.ai
Application name: SHAYAN AI

The current web UI is responsive and uses the SHAYAN AI dark blue/purple visual theme. App icon and splash artwork should be placed in the generated Android project's res/mipmap and drawable resources before release.
