# Atlas Mobile Intro —
Workout/Excersise Tracker (Expo + React Native)

A simple multi-screen mobile app built with **Expo Router** that lets you:
- Create **Users** (User Information)
- Add **Activities** to each user (Strength or Conditioning)
- View activities in a scrolling list (**FlashList**)
- Delete activities via **Swipe-to-Delete**
- Delete all activities for a user
- Persist data using a local **SQLite database** (native) and a web-friendly DB layer (web)

---

## Table of Contents
- [Atlas Mobile Intro —](#atlas-mobile-intro-)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Features](#features)
    - [✅ Routing (Expo Router)](#-routing-expo-router)
    - [✅ FlashList](#-flashlist)
    - [✅ SQLite Database](#-sqlite-database)
    - [✅ Delete All](#-delete-all)
    - [✅ Swipe to Delete](#-swipe-to-delete)
    - [✅ Styling](#-styling)
  - [Tech Stack](#tech-stack)
  - [Folder Structure](#folder-structure)

---

## Project Overview

This app is a **Sports Performance Tracker** built for the Atlas "mobile intro" objectives:
- Basic routing between screens
- Displaying data with FlashList
- Basic gestures (swipe to delete)
- Using a database in a mobile application

The app stores users and activity logs so you can track workouts like:
- Strength: sets, reps, weight, notes
- Conditioning: duration, distance, notes

---

## Features

### ✅ Routing (Expo Router)
- Home screen (`/`) shows users + a button to add a new user
- Add user screen (`/add-user`)
- User detail screen (`/user/[id]`) shows that user’s activities
- Add activity screen (`/user/[id]/add-activity`)
- Edit activity screen (`/user/[id]/edit-activity/[activityId]`)

### ✅ FlashList
- Activities for a user are displayed using **@shopify/flash-list**
- List scrolls naturally as the activity list grows

### ✅ SQLite Database
- Native (iOS/Android): persistent storage with `expo-sqlite`
- Web: uses a web-compatible DB layer so the app can run in the browser without native SQLite issues

### ✅ Delete All
- “Delete All Activities” removes all activities tied to a user

### ✅ Swipe to Delete
- Swipe left/right on an activity to reveal a delete action
- Tap delete to remove the activity from the database

### ✅ Styling
- Clean UI with card-style rows, badges, and consistent spacing

---

## Tech Stack
- **Expo** + **React Native**
- **Expo Router** (file-based navigation)
- **@shopify/flash-list** (high-performance lists)
- **react-native-gesture-handler** + **react-native-reanimated** (gestures + animations)
- **expo-sqlite** (native database)
- TypeScript

---

## Folder Structure

```txt
atlas-mobile-intro/
└── MyReactNativeApp/
    ├── app/                         # Expo Router routes
    │   ├── _layout.tsx
    │   ├── index.tsx                # Home: Users
    │   ├── add-user.tsx             # Add User screen
    │   └── user/
    │       └── [id]/
    │           ├── index.tsx         # User detail: Activities list
    │           ├── add-activity.tsx  # Add Activity screen
    │           └── edit-activity/
    │               └── [activityId].tsx
    ├── src/
    │   ├── db.ts                    # Re-export / platform DB selection
    │   ├── db.native.ts             # SQLite implementation (iOS/Android)
    │   ├── db.web.ts                # Web DB implementation
    │   ├── ActivityRow.tsx          # Activity list row component
    │   └── SwipeToDelete.tsx        # Gesture wrapper
    ├── package.json
    └── README.md
