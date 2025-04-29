# Activity Tracker App

A beautiful and functional React Native application for tracking personal activities across different categories such as Health, Education, Productivity, Hobbies, Social, and Mental/Spiritual activities.

![Activity Tracker App Screenshot](https://via.placeholder.com/300x600)

## Features

- Create, edit, and delete activities
- Mark activities as complete/incomplete
- Filter activities by category
- Beautiful UI with gradient backgrounds
- Form validation
- Persistent data storage
- Fully responsive design

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14.x or newer)
- [npm](https://www.npmjs.com/) (v6.x or newer) or [Yarn](https://yarnpkg.com/) (v1.22.x or newer)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/) (v4.x or newer)
- For iOS development: Xcode (Mac only)
- For Android development: Android Studio

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/activity-tracker-app.git
   cd activity-tracker-app
   ```

2. Install dependencies:
   ```bash
   # Using npm
   npm install
   
   # OR using Yarn
   yarn install
   ```

3. Install Expo CLI globally (if not already installed):
   ```bash
   # Using npm
   npm install -g expo-cli
   
   # OR using Yarn
   yarn global add expo-cli
   ```

## Project Dependencies

This project relies on the following key packages:

- `react-native`: The core React Native framework
- `expo`: Development platform for building universal apps
- `@react-native-async-storage/async-storage`: For persistent local storage
- `react-native-safe-area-context`: For handling safe area insets
- `twrnc`: Tailwind React Native Classnames for styling
- `@expo/vector-icons`: Icon library for UI components
- `expo-linear-gradient`: For gradient effects throughout the UI

## Running the App

1. Start the development server:
   ```bash
   # Using npm
   npm start
   
   # OR using Yarn
   yarn start
   
   # OR using Expo CLI
   expo start
   ```

2. Run on specific platforms:

   **iOS Simulator** (Mac only):
   ```bash
   # Using npm
   npm run ios
   
   # OR using Yarn
   yarn ios
   
   # OR using Expo CLI
   expo start --ios
   ```

   **Android Emulator**:
   ```bash
   # Using npm
   npm run android
   
   # OR using Yarn
   yarn android
   
   # OR using Expo CLI
   expo start --android
   ```

   **Web Browser**:
   ```bash
   # Using npm
   npm run web
   
   # OR using Yarn
   yarn web
   
   # OR using Expo CLI
   expo start --web
   ```

3. Run on physical device:
   - Install the Expo Go app on your [iOS](https://apps.apple.com/app/expo-go/id982107779) or [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) device
   - Scan the QR code from the terminal with your camera app (iOS) or the Expo Go app (Android)

## Project Structure

```
activity-tracker-app/
├── assets/            # Contains images, fonts, and other static assets
│   └── images/
│       └── Asset3.png # App logo
├── components/        # Reusable UI components
├── screens/
│   └── HomeScreen.js  # Main app screen
├── App.js             # Entry point for the application
├── app.json           # Expo configuration
└── package.json       # Project dependencies and scripts
```

## Usage

1. **Adding a New Activity**:
   - Fill in the activity title (minimum 5 characters)
   - Select a date
   - Choose an activity type from the dropdown
   - Tap "Save Activity"

2. **Editing an Activity**:
   - Tap the edit (pencil) icon on any activity card
   - Modify the details in the edit modal
   - Tap "Save Changes"

3. **Deleting an Activity**:
   - Tap the trash icon on any activity card
   - Confirm deletion in the alert dialog

4. **Marking an Activity as Complete**:
   - Tap the circle checkbox on any activity card

5. **Filtering Activities**:
   - Use the horizontal scrolling filter chips to view activities by category

## Customization

You can easily customize the app's colors by modifying the following constants in `HomeScreen.js`:

```javascript
const PINK_COLOR = '#ff90bb';
const BLUE_COLOR = '#8accd5';
```

## Building for Production

To create a production build:

1. **For Expo builds (easiest)**:
   
   ```bash
   expo build:android  # For Android APK/AAB
   expo build:ios      # For iOS IPA (requires Apple Developer account)
   ```

2. **For standalone builds**:
   - Follow the [React Native documentation](https://reactnative.dev/docs/signed-apk-android) for Android
   - Follow the [React Native documentation](https://reactnative.dev/docs/publishing-to-app-store) for iOS

## Troubleshooting

- **Metro bundler issues**: Try clearing the cache with `expo start -c`
- **Dependencies conflicts**: Try reinstalling node modules with `rm -rf node_modules && npm install`
- **Device connection issues**: Ensure your development machine and device are on the same network

## License

[MIT](LICENSE)

## Acknowledgements

- UI design inspired by modern mobile application design trends
- Icons provided by Ionicons through Expo vector icons

---

## Contact

For questions or support, please open an issue in the GitHub repository or contact [rayynie21@gmail.com](mailto:rayynie21@gmail.com).