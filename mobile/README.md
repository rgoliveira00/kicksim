# Marketplace Mobile App

A React Native mobile application for the multi-sided marketplace platform.

## Features

- **Cross-platform**: iOS and Android support
- **Authentication**: Secure login/registration with JWT
- **Multi-role support**: Buyer, Seller, and Admin roles
- **Product catalog**: Browse and search products
- **Shopping cart**: Add/remove items, manage quantities
- **Order management**: Track orders and delivery status
- **Real-time messaging**: Chat between buyers and sellers
- **Reviews and ratings**: Rate products and sellers
- **Push notifications**: Order updates and messages
- **Offline support**: Basic functionality when offline

## Tech Stack

- **Framework**: React Native 0.73.2
- **Language**: TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: React Navigation 6
- **UI Components**: React Native Paper (Material Design 3)
- **HTTP Client**: Axios with interceptors
- **Storage**: AsyncStorage + Keychain (secure)
- **Real-time**: Socket.IO client
- **Images**: React Native Fast Image
- **Icons**: React Native Vector Icons

## Prerequisites

- Node.js 18+
- React Native CLI or Expo CLI
- iOS: Xcode 14+ (for iOS development)
- Android: Android Studio with SDK 33+ (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Development

### Start Metro Bundler
```bash
npm start
```

### Run on iOS
```bash
npm run ios
```

### Run on Android
```bash
npm run android
```

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── constants/          # App constants (theme, config)
├── hooks/              # Custom React hooks
├── navigation/         # Navigation configuration
├── screens/           # Screen components
│   ├── auth/          # Authentication screens
│   ├── main/          # Main app screens
│   ├── onboarding/    # Onboarding flow
│   └── ...
├── services/          # API and external services
├── store/             # Redux store and slices
│   └── slices/        # Redux Toolkit slices
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Key Features Implementation

### Authentication Flow
- Secure token storage using Keychain
- Automatic token refresh
- Biometric authentication support
- Role-based access control

### State Management
- Redux Toolkit for global state
- Redux Persist for data persistence
- Typed hooks for type safety
- Optimistic updates for better UX

### Navigation
- Stack navigation for screens
- Tab navigation for main sections
- Deep linking support
- Authentication-aware routing

### Real-time Features
- Socket.IO for live messaging
- Push notifications
- Order status updates
- Typing indicators

### Offline Support
- Redux Persist for offline data
- Network status detection
- Offline queue for actions
- Sync when back online

## API Integration

The app connects to the Node.js backend API:

- **Base URL**: Configured in `.env`
- **Authentication**: JWT tokens with refresh
- **Error Handling**: Centralized error management
- **Request/Response**: Typed interfaces
- **Caching**: Redux state + AsyncStorage

## Build and Deployment

### Development Build
```bash
# iOS
npm run build:ios

# Android
npm run build:android
```

### Production Build
1. Update version in `package.json`
2. Configure signing certificates
3. Build release version
4. Test on physical devices
5. Submit to app stores

### App Store Submission
- Follow Apple App Store guidelines
- Ensure all required metadata is provided
- Test on various iOS devices
- Submit for review

### Google Play Submission
- Follow Google Play Store policies
- Generate signed APK/AAB
- Test on various Android devices
- Submit for review

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `API_BASE_URL` | Backend API URL | Yes |
| `APP_NAME` | Application name | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe payment key | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests (if configured)
npm run test:e2e
```

## Performance Optimization

- **Images**: Fast Image with caching
- **Lists**: FlatList with optimization
- **Navigation**: Lazy loading of screens
- **Bundle**: Code splitting where possible
- **Memory**: Proper cleanup of listeners

## Security

- **Secure Storage**: Keychain for sensitive data
- **Network**: Certificate pinning (production)
- **Code**: Obfuscation for production builds
- **API**: Request signing and validation

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npm run clean
   npm start -- --reset-cache
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android build issues**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

### Debug Tools

- **Flipper**: For debugging and network inspection
- **React Native Debugger**: For Redux and React debugging
- **Reactotron**: For state and API monitoring

## Contributing

1. Follow TypeScript best practices
2. Use conventional commit messages
3. Add tests for new features
4. Update documentation as needed
5. Ensure code passes linting

## License

This project is licensed under the MIT License.

