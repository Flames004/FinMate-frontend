# FinMate Mobile Application

**FinMate** is a modern, intuitive mobile application designed to gamify financial literacy and simplify budget management. Featuring a beautiful, fully localized aesthetic and a Duolingo-inspired learning roadmap, FinMate helps users master cash flow dynamically.

## Technologies Used
- **React Native** & **Expo** - Cross-platform mobile development
- **React Navigation** - Fluid deep linking and stack/tab navigation flows
- **NativeWind (TailwindCSS)** - Rapid UI scaffolding and aesthetic atomic styling
- **AsyncStorage** - Robust local caching to enable offline capabilities
- **Axios** - Efficient and resilient API integrations

## Core Features
- **Gamified Learning**: A winding visual roadmap where users unlock sequential modules. Answer interactive quizzes successfully to master topics and increase your level.
- **50/30/20 Budgeting**: An integrated smart budget calculator mapping expenses natively into Needs, Wants, and Savings using interactive progress bars.
- **OTP Authentication**: Pure passwordless login system fully integrated with a cloud-sync architecture. Log out flawlessly and retain all custom transactions dynamically.
- **News & Tools**: Stay current with financial tools like real-time curated news and currency converters.

## Getting Started

### Prerequisites
- Node.js
- Expo CLI
- Expo Go App (iOS/Android) 

### Installation
1. Move to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install the necessary packages:
   ```bash
   npm install
   ```

### Environment Variables
Configure your base API connection string inside a `.env` file:
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```
*(Note: If launching on a physical Android device bridging localhost, ensure you bind the API_URL to your computer's local IP address instead of localhost).*

### Running the App
Launch the Expo bundler:
```bash
npx expo start
```
You can press `a` to open Android, `i` for iOS emulator, or utilize the Expo Go app connected to the same Wi-Fi network to scan the provided QR code.

## Folder Structure
- `/src/components` - Reusable UI elements
- `/src/context` - Global state managers (e.g. `AuthContext.tsx` handles complex sync)
- `/src/screens` - Main navigation pages (Login, Dashboard, Budget, Roadmap, Profile)
- `/src/services` - Decoupled REST/API logic
- `/src/data` - Local JSON stores controlling the gamified modules
