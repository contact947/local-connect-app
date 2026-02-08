import { describe, it, expect } from "vitest";

describe("Firebase Configuration", () => {
  it("should have all required Firebase environment variables", () => {
    expect(process.env.EXPO_PUBLIC_FIREBASE_API_KEY).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID).toBeDefined();
    expect(process.env.EXPO_PUBLIC_FIREBASE_APP_ID).toBeDefined();
  });

  it("should have valid Firebase API Key format", () => {
    const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
    expect(apiKey).toBeTruthy();
    expect(apiKey?.length).toBeGreaterThan(20);
  });

  it("should have valid Firebase Auth Domain format", () => {
    const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
    expect(authDomain).toBeTruthy();
    expect(authDomain).toMatch(/\.firebaseapp\.com$/);
  });

  it("should have valid Firebase Project ID format", () => {
    const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
    expect(projectId).toBeTruthy();
    expect(projectId?.length).toBeGreaterThan(0);
  });

  it("should have valid Firebase Storage Bucket format", () => {
    const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
    expect(storageBucket).toBeTruthy();
    expect(storageBucket).toMatch(/\.firebasestorage\.app$/);
  });

  it("should have valid Firebase Messaging Sender ID format", () => {
    const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
    expect(messagingSenderId).toBeTruthy();
    expect(messagingSenderId).toMatch(/^\d+$/);
  });

  it("should have valid Firebase App ID format", () => {
    const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
    expect(appId).toBeTruthy();
    expect(appId).toMatch(/^1:\d+:web:[a-f0-9]+$/);
  });
});
