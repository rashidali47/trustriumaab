# Trustrium Mobile App Build Guide 🚀

Congratulations on taking this big step! Since your local machine is slow, we use **GitHub Actions** to build your app in the cloud.

## How to get your AAB and APK:

1.  **Push to GitHub:** Push these changes to your GitHub repository (`main` or `master` branch).
2.  **Go to 'Actions':** On your GitHub repository page, click the **"Actions"** tab at the top.
3.  **Wait for Build:** You will see a workflow named "Build Android App" running. It takes about 3-5 minutes.
4.  **Download:** Once it turns green, click on the build run. Scroll down to **"Artifacts"** and download `Trustrium-Debug-APK`.

## Why we used Capacitor (and fixed the White Screen):
The white screen you saw was likely because the mobile WebView blocks local file cookies/routing. We added a `server` configuration in `capacitor.config.ts` that forces the app to use `https://app.trustrium.com` as its internal hostname. This makes login redirects work perfectly!

## Brand New Features 🛠️
- **Professional Utility Hub:** We've added a "Tools" section in the navigation.
- **Client-Side ZIP Extractor:** Extract and view ZIP files directly in the app. This is fast and secure because no data leaves the device!
- **Password Generator:** Generate strong, secure passwords on the fly.
- **Text Converter:** Quick text manipulation tools (Uppercase/Lowercase).
- **SEO Ready:** The app now includes optimized meta tags, descriptions, and open-graph data, making it ready for high visibility on Google and social media.

## Pro Tip for Play Store:
Using these tools gives your app more "Utility Value," which Google Play Store reviewers love. It moves your app from being a simple "web wrapper" to a functional mobile utility!

