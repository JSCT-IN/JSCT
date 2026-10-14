import { initializeApp, getApps, getApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import type { Auth, ConfirmationResult } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { FirebaseStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";

/**
 * JSCT Official Firebase Configuration
 * Project: jsct-9daf4
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAvOaLN6pJ1MxdSo6UGiEjhpAHomYReaQk",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "jsct-9daf4.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "jsct-9daf4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "jsct-9daf4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1083688849745",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1083688849745:web:0fdd8c7f90a615650b8370",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-DCHMXRPY32",
};

// Initialize Firebase App safely (singleton pattern across SSR & client)
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firebase Core Services (lazily/safely accessed)
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Safe Analytics Initializer for Next.js App Router (Browser Client-only)
let analyticsInstance: Analytics | null = null;
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window !== "undefined") {
    try {
      const supported = await isSupported();
      if (supported) {
        if (!analyticsInstance) {
          analyticsInstance = getAnalytics(app);
        }
        return analyticsInstance;
      }
    } catch (err) {
      console.warn("[Firebase Analytics] Initialization skipped:", err);
    }
  }
  return null;
}

/**
 * Sets up invisible reCAPTCHA verifier for Firebase Phone Auth
 */
export function setupRecaptcha(containerId: string = "recaptcha-container"): RecaptchaVerifier | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = (window as any).recaptchaVerifier;
    if (existing) {
      return existing;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      return null;
    }

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved
      },
      "expired-callback": () => {
        console.warn("[Firebase Auth] reCAPTCHA expired, please retry.");
      },
    });

    (window as any).recaptchaVerifier = verifier;
    return verifier;
  } catch (error) {
    console.error("[Firebase Auth] Error setting up reCAPTCHA:", error);
    return null;
  }
}

/**
 * Trigger SMS OTP verification code via Firebase Phone Auth
 */
export async function sendFirebasePhoneOtp(
  rawPhoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  // Ensure E.164 format: e.g. +91XXXXXXXXXX
  const digits = rawPhoneNumber.replace(/\D/g, "");
  const formatted = digits.startsWith("91") && digits.length === 12
    ? `+${digits}`
    : digits.length === 10
    ? `+91${digits}`
    : `+${digits}`;

  return await signInWithPhoneNumber(auth, formatted, verifier);
}

/**
 * Confirm 6-digit verification code with Firebase Phone Auth
 */
export async function verifyFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  verificationCode: string
) {
  return await confirmationResult.confirm(verificationCode);
}


/**
 * Sync registered member record directly to Firebase Firestore
 * Creates / updates doc in 'members' collection
 */
export async function syncMemberToFirestore(member: {
  id?: string;
  membership_id: string;
  full_name: string;
  phone: string;
  email?: string;
  aadhaar_last4?: string;
  aadhaar_hash?: string;
  department?: string;
  designation?: string;
  status?: string;
  district?: string;
  state?: string;
}): Promise<boolean> {
  try {
    const docId = member.membership_id || member.id || `M-${Date.now()}`;
    const docRef = doc(db, "members", docId);
    await setDoc(
      docRef,
      {
        ...member,
        updated_at: new Date().toISOString(),
        synced_to_firebase: true,
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn("[Firebase Firestore] Member sync notice:", err);
    return false;
  }
}

/**
 * Search member in Firestore by Aadhaar hash, phone, or membership ID
 */
export async function findFirestoreMember(identifier: string) {
  try {
    const clean = identifier.trim();
    const digits = clean.replace(/\D/g, "");
    const membersRef = collection(db, "members");

    // Check membership_id first
    const idQuery = query(membersRef, where("membership_id", "==", clean));
    const idSnap = await getDocs(idQuery);
    if (!idSnap.empty) {
      return { id: idSnap.docs[0].id, ...idSnap.docs[0].data() };
    }

    // Check phone
    if (digits.length >= 10) {
      const phoneDigits = digits.slice(-10);
      const phoneQuery = query(membersRef, where("phone", ">=", phoneDigits));
      const phoneSnap = await getDocs(phoneQuery);
      if (!phoneSnap.empty) {
        return { id: phoneSnap.docs[0].id, ...phoneSnap.docs[0].data() };
      }
    }

    return null;
  } catch (err) {
    console.warn("[Firebase Firestore] Member lookup notice:", err);
    return null;
  }
}
