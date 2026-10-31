# Installing HomeOS on your iPhone (TestFlight)

TestFlight is Apple's app for installing your own app before it is on the App Store.

## One-time setup

1. Join the Apple Developer Program at https://developer.apple.com/programs ($99/year).
2. Create a free Expo account at https://expo.dev.
3. On a Mac or Windows computer, install Node.js (https://nodejs.org, the LTS version).
4. Open Terminal (Mac) or PowerShell (Windows) and run:

   ```
   npm install -g eas-cli
   git clone https://github.com/tipsybrush/homeos.git
   cd homeos
   npm install
   eas login
   eas init
   ```

   `eas init` links the project to your Expo account. Answer "yes" to its questions.

## Each time you want a new version on your phone

```
cd homeos
git pull
eas build -p ios --profile production
eas submit -p ios --latest
```

- The build runs on Expo's servers, so no Xcode is needed.
- The first build asks for your Apple ID and sets up certificates for you. Answer "yes" when it offers to handle them.
- After `eas submit`, Apple takes a short while to process the build. Then it shows up in App Store Connect under TestFlight.

## On your iPhone

1. Install **TestFlight** from the App Store.
2. In App Store Connect, open TestFlight, go to Internal Testing, and add yourself as a tester.
3. Open TestFlight on the phone and tap **Install** next to HomeOS.
