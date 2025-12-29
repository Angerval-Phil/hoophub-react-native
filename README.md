# 🏀 HoopHub - NBA Stats & Scores App

A React Native app for NBA fans built with Expo. Get live scores, search player stats, and stay updated with NBA news.

## Features

- **Games** - Live scores, today's schedule, and recent results
- **Players** - Search any NBA player and view their stats
- **News** - Latest NBA news from ESPN
- **Settings** - Pick your favorite team

## Tech Stack

- React Native + Expo
- React Navigation (tabs + stack)
- Axios for API calls
- ESPN API (games, news)
- BallDontLie API (player stats)

---

## 🚀 Quick Start (Windows)

### Prerequisites

1. **Node.js** (v18 or later) - [Download](https://nodejs.org/)
2. **Expo Go App** on your phone - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779)

### Setup

```bash
# 1. Clone or download this project
cd hoophub-react-native

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start
```

### Running the App

After running `npx expo start`, you'll see a QR code in the terminal.

**On your phone:**
1. Open the **Expo Go** app
2. Scan the QR code
3. The app will load on your phone! 📱

**On Android Emulator (optional):**
1. Install Android Studio
2. Create a virtual device
3. Press `a` in the terminal to open on Android

---

## 📁 Project Structure

```
hoophub-react-native/
├── App.js                 # Entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
├── src/
│   ├── api/
│   │   └── index.js       # ESPN + BallDontLie API calls
│   ├── components/
│   │   └── index.js       # Reusable UI components
│   ├── navigation/
│   │   └── AppNavigator.js # Tab + Stack navigation
│   ├── screens/
│   │   ├── GamesScreen.js
│   │   ├── GameDetailScreen.js
│   │   ├── PlayersScreen.js
│   │   ├── PlayerDetailScreen.js
│   │   ├── NewsScreen.js
│   │   └── SettingsScreen.js
│   └── theme/
│       └── index.js       # Colors, typography, team colors
└── assets/                # Images and icons
```

---

## ⚙️ Configuration

### BallDontLie API Key

1. Get a free API key at https://app.balldontlie.io
2. Open `src/api/index.js`
3. Replace `YOUR_API_KEY_HERE` with your key:

```javascript
const BALLDONTLIE_API_KEY = 'your-actual-api-key';
```

---

## 📱 Building for Production

### Android APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build Android APK
eas build --platform android --profile preview
```

### iOS (No Mac Required!)

```bash
# Build iOS (uses Expo's cloud)
eas build --platform ios
```

You'll need an Apple Developer account ($99/year) for iOS distribution.

---

## 🎨 Customization

### Colors

Edit `src/theme/index.js` to change the color scheme:

```javascript
export const colors = {
  primary: '#0C2340',      // Deep Navy
  secondary: '#F05E23',    // Basketball Orange
  background: '#0A0A0A',   // Near Black
  // ... more colors
};
```

### Team Colors

All 30 NBA team colors are included in `teamColors` object.

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| expo | Development framework |
| @react-navigation/* | Navigation |
| axios | HTTP requests |
| expo-haptics | Touch feedback |
| expo-web-browser | Open news links |
| @expo/vector-icons | Icons |

---

## 🔧 Troubleshooting

### "Unable to resolve module"
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start -c
```

### "Network request failed"
- Check your internet connection
- Verify API endpoints are accessible
- Check if BallDontLie API key is valid

### QR Code not scanning
- Make sure phone and computer are on same WiFi
- Try pressing `w` to open web version instead

---

## 🤝 Using with Claude Code in Cursor

Once the project is set up, you can ask Claude Code to:

- "Add a standings screen showing conference rankings"
- "Create a player comparison feature"
- "Add dark/light theme toggle"
- "Implement pull-to-refresh with a custom animation"
- "Add a widget for live scores"

---

## 📄 License

MIT License - feel free to use this for your own projects!

---

## 🙏 Credits

- Data: ESPN API, BallDontLie API
- Icons: Ionicons (@expo/vector-icons)
- Framework: Expo + React Native

---

**Happy Coding! 🏀**
