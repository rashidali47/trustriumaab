import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.trustrium.app',
  appName: 'Trustrium',
  webDir: 'dist',
  server: {
    // This part is CRITICAL for fixing the white screen.
    // It allows the app to handle routing and cookies like a real website.
    androidScheme: 'https',
    hostname: 'app.trustrium.com',
    cleartext: true,
    allowNavigation: ['app.trustrium.com', '*.trustrium.com']
  }
};

export default config;
