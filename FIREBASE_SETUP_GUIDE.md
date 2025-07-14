# 🔥 Firebase Setup Guide - AvaliaNutri Platform

## 📋 Overview

This guide will help you configure real Firebase integration for the AvaliaNutri platform, replacing the current mock/demo data with live Firebase services.

## 🚀 Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
- Visit: https://console.firebase.google.com/
- Click "Create a project" or "Add project"

### 1.2 Project Configuration
- **Project name**: `avalianutri-prod` (or your preferred name)
- **Enable Google Analytics**: Recommended for user insights
- **Analytics account**: Create new or use existing

### 1.3 Project Settings
- Go to Project Settings (gear icon)
- Note down your project details for later use

## 🔧 Step 2: Configure Authentication

### 2.1 Enable Authentication
- Go to **Authentication** > **Sign-in method**
- Enable **Email/Password** authentication
- Configure authorized domains (add your domain)

### 2.2 User Management
- Set up user roles (professor/student)
- Configure email verification if needed
- Set password requirements

## 📊 Step 3: Setup Firestore Database

### 3.1 Create Database
- Go to **Firestore Database**
- Click "Create database"
- Choose **Production mode** for security
- Select database location (closest to your users)

### 3.2 Database Structure
Create these collections:

```
/users/{userId}
  - email: string
  - fullName: string
  - role: 'professor' | 'student'
  - anonymousId: string
  - institutionId: string
  - totalScore: number
  - levelReached: number
  - gamesCompleted: number
  - createdAt: timestamp
  - updatedAt: timestamp

/courses/{courseId}
  - name: string
  - code: string
  - professorId: string
  - students: array
  - modules: array
  - createdAt: timestamp

/gameProgress/{progressId}
  - userId: string
  - gameId: number
  - score: number
  - completed: boolean
  - attempts: number
  - completedAt: timestamp

/achievements/{achievementId}
  - userId: string
  - type: string
  - title: string
  - description: string
  - earnedAt: timestamp
```

## 🔐 Step 4: Security Rules

### 4.1 Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Professors can read their course data
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        resource.data.professorId == request.auth.uid;
    }
    
    // Users can read/write their own progress
    match /gameProgress/{progressId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## 🌐 Step 5: Get Configuration Keys

### 5.1 Web App Configuration
- Go to **Project Settings** > **General**
- Scroll to "Your apps" section
- Click "Add app" > Web app icon
- Register app name: "AvaliaNutri Web"
- Copy the configuration object

### 5.2 Update Environment Variables
Replace the values in `.env.local` and `.env.production`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 📱 Step 6: Test Configuration

### 6.1 Verify Connection
- Start the development server: `npm run dev`
- Check browser console for Firebase connection
- Test user registration and login

### 6.2 Test Data Flow
- Register a test user
- Verify user data appears in Firestore
- Test game progress saving
- Check professor dashboard data

## 🔄 Step 7: Data Migration

### 7.1 Import Demo Data (Optional)
- Use Firebase Admin SDK to import sample data
- Create test users and courses
- Populate with sample game progress

### 7.2 Backup Strategy
- Set up automated Firestore backups
- Configure data export schedules
- Plan disaster recovery procedures

## 🚨 Important Notes

### Security Considerations
- Never commit real API keys to version control
- Use environment variables for all sensitive data
- Regularly review and update security rules
- Monitor authentication logs

### Performance Optimization
- Index frequently queried fields
- Use pagination for large datasets
- Implement proper caching strategies
- Monitor Firestore usage and costs

### Development vs Production
- Use separate Firebase projects for dev/prod
- Different security rules for each environment
- Separate analytics and monitoring

## 📞 Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Review browser console for client-side errors
3. Verify environment variables are correctly set
4. Test with Firebase emulators for development

## ✅ Checklist

- [ ] Firebase project created
- [ ] Authentication configured
- [ ] Firestore database setup
- [ ] Security rules implemented
- [ ] Environment variables updated
- [ ] Web app registered
- [ ] Configuration tested
- [ ] Demo data imported (optional)
- [ ] Backup strategy implemented
