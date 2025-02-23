# KamandXchange - A Campus Marketplace

A React Native mobile application built with Expo and Supabase that allows students to buy and sell items within their campus community.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/campus-marketplace.git
cd campus-marketplace
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start / npx expo start
# or
yarn start
```

4. Run on your web browser:
- after running above command, you will see a localhost link, click on it and you will be redirected to the app in your web browser (preferebly chrome). Inspect the app with chrome's developer tools to view the app on your phone.

## Project Structure

```
campus-marketplace/
├── app/                    # Main application code
│   ├── (tabs)/            # Tab-based navigation screens
│   ├── auth/              # Authentication screens
│   ├── chat/              # Chat functionality
│   ├── components/        # Reusable UI components
│   ├── context/          # React Context providers
│   ├── lib/              # Utility functions and API calls
│   ├── screens/          # Main screen components
│   ├── types/            # TypeScript type definitions
│   └── _layout.tsx       # Root layout configuration
├── assets/               # Static assets (images, fonts)
└── README.md            # Project documentation
```

## Features

- **Authentication**: Email-based signup and login
- **Listings Management**: Create, view, update, and delete product listings
- **Real-time Chat**: Direct messaging between buyers and sellers
- **Image Upload**: Support for multiple product images
- **Categories**: Browse items by category
- **Profile Management**: User profile and settings

## Technical Overview

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for images
- **Real-time**: Supabase Realtime for chat and listings updates
- **Navigation**: Expo Router for type-safe navigation
- **Styling**: React Native StyleSheet

## Database Schema

The application uses the following main tables:
- `listings`: Product listings with details
- `messages`: Chat messages between users
- `profiles`: User profile information
