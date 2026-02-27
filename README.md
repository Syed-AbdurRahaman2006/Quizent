# AdaptIQ - Adaptive Quiz & Competency Assessment Platform

An intelligent, adaptive quiz platform that dynamically adjusts difficulty based on user performance, with AI-powered learning recommendations.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat&logo=firebase)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat&logo=tailwindcss)

## Features

- **Adaptive Quiz Engine** — Difficulty adjusts in real-time based on answers (Easy ↔ Medium ↔ Hard)
- **Dual Roles** — User dashboards and Admin analytics/quiz management
- **AI Insights** — Gemini-powered personalized learning recommendations
- **Rich Analytics** — Chart.js visualizations for performance tracking
- **Firebase Backend** — Auth, Firestore, Hosting, Cloud Functions
- **Premium Dark UI** — Glassmorphism, gradients, micro-animations

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase project with Authentication and Firestore enabled

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
Copy the environment template and fill in your Firebase credentials:
```bash
cp .env.example .env
```

Edit `.env` with your Firebase project configuration:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_key  # Optional
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### 3. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → Google Sign-In
4. Enable **Cloud Firestore**
5. Copy your web app config to `.env`

### 4. Run Development Server
```bash
npm run dev
```

### 5. Make Yourself Admin
After first login, update your user document in Firestore:
- Go to Firestore console → `users` collection → your user document
- Change `role` from `"user"` to `"admin"`

## Project Structure
```
src/
├── components/       # Reusable UI components
├── firebase/         # Firebase config
├── hooks/            # React hooks (auth)
├── pages/            # Page components
│   ├── admin/        # Admin pages
│   └── ...           # User pages
├── services/         # Firebase service layer
├── types/            # TypeScript interfaces
└── utils/            # Adaptive engine, seed data
```

## Adaptive Quiz Logic
```
Correct:  Easy → Medium → Hard → Hard
Incorrect: Hard → Medium → Easy → Easy
```
Each quiz starts at **Medium** difficulty and adapts per answer.

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase deploy
```

### Deploy Cloud Function (for production Gemini API)
```bash
cd functions
npm install
firebase functions:config:set gemini.api_key="YOUR_KEY"
firebase deploy --only functions
```

## Demo Mode
The app works without Firebase credentials using built-in demo data. Authentication will fail without valid Firebase credentials, but you can explore the codebase and UI components.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Charts | Chart.js + react-chartjs-2 |
| AI | Google Gemini API |
| Hosting | Firebase Hosting |
| Icons | Lucide React |

# Quizent
