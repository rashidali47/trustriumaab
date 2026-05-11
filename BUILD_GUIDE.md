# Trustrium Mobile App Build Guide 🚀

Congratulations on taking this big step! Since your local machine is slow, we use **GitHub Actions** to build your app in the cloud.

## How to get your AAB and APK:

1.  **Push to GitHub:** Push these changes to your GitHub repository (`main` or `master` branch).
2.  **Go to 'Actions':** On your GitHub repository page, click the **"Actions"** tab at the top.
3.  **Wait for Build:** You will see a workflow named "Build Android App" running. It takes about 3-5 minutes.
4.  **Download:** Once it turns green, click on the build run. Scroll down to **"Artifacts"** and download `Trustrium-Debug-APK`.

## Why we used Capacitor (and fixed the White Screen):
The white screen you saw was likely because the mobile WebView blocks local file cookies/routing. We added a `server` configuration in `capacitor.config.ts` that forces the app to use `https://app.trustrium.com` as its internal hostname. This makes login redirects work perfectly!

## Next Steps for Play Store (Professional Polish):
- **Icons & Splash:** Use a tool like `@capacitor/assets` to generate all icon sizes at once.
- **Signing:** For the Play Store, you need a "Signed AAB". To do this in the cloud, you'll eventually need to add your `KEYSTORE` file to GitHub Secrets.
- **Privacy Policy:** Since you handle login, the Play Store requires a privacy policy URL. You can host one for free on GitHub Pages if needed.

You are doing great! Keep building.
