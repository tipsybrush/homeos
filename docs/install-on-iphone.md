# Installing HomeOS on your iPhone (free, no App Store)

This puts HomeOS on your iPhone as a real app, built by your MacBook. It uses
your normal Apple ID, with no developer fee and no App Store.

The one catch: Apple makes free installs expire after **7 days**. When the app
stops opening, plug the phone in and run the "Each week" step again. Your data
in the app stays.

## One-time setup on the Mac

1. Install **Xcode** from the Mac App Store (free, large download). Open it once
   and let it finish installing its extra components.
2. In Xcode, open **Settings → Accounts**, click **+**, choose **Apple ID** and
   sign in. This creates your free "Personal Team".
3. Install **Node.js** from https://nodejs.org (the LTS button).
4. Open **Terminal** (Cmd + Space, type Terminal) and paste these lines, one at a time:

   ```
   git clone https://github.com/tipsybrush/homeos.git
   cd homeos
   npm install
   ```

## One-time setup on the iPhone

1. Plug the iPhone into the Mac with a cable. Tap **Trust** on the phone if it asks.
2. Turn on **Developer Mode**: Settings → Privacy & Security → Developer Mode → On.
   The phone restarts; confirm when it asks.

## Install (and each week, to renew)

With the phone plugged in and unlocked, in Terminal:

```
cd homeos
git pull
npm install
npm run phone
```

- The first time, it may ask which device to use (pick your iPhone) and which
  team to sign with (pick your Personal Team).
- The first build takes a while. Later ones are quicker.
- The first time the app is installed, iOS blocks it until you trust it:
  Settings → General → VPN & Device Management → your Apple ID → **Trust**.

The app is built in release mode, so it runs on its own. The Mac doesn't need to
stay connected or switched on.

## If something goes wrong

Take a screenshot of the Terminal error and send it in the HomeOS thread.
