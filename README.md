# Easylane logistics Driver

A mobile-first web application designed for Indian truck drivers. Features include trip management, real-time navigation, leaderboards, issue reporting, offline capabilities, and multi-language support.

## Features

- **Authentication & Profile Management**: Secure login and driver profile customization
- **Trip Management**: View, track, and manage deliveries with detailed trip information
- **Real-time Navigation**: Integrated map-based navigation using Leaflet
- **Issue Reporting**: Report delivery issues with photo/signature capture
- **Proof of Delivery (POD)**: Digital signature and documentation for deliveries
- **Leaderboard**: Driver performance tracking and gamification
- **Offline Support**: Queue-based system for offline operations
- **Multi-language Support**: Internationalized UI with i18n
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## Project Structure

```
src/
  ├── screens/          # Main application screens
  ├── components/       # Reusable UI components
  ├── services/         # API, location, OCR, and offline services
  ├── store/            # Zustand state management (driver, trips, features, location)
  ├── context/          # React context for notifications
  └── i18n.ts          # Internationalization setup
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation & Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory (if needed for API configuration)
4. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run clean` - Remove dist folder
- `npm run lint` - Run TypeScript type checking

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Zustand** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Leaflet & React-Leaflet** - Mapping
- **i18n** - Internationalization
- **Express** - Server backend
- **Better-SQLite3** - Local database

## Development Notes

- The app uses a mobile-first design pattern (max-width: md)
- State management is handled by Zustand stores
- API calls are centralized in `services/api.ts`
- Location tracking uses `services/locationService.ts`
- Offline functionality is managed by `services/offlineQueue.ts`
