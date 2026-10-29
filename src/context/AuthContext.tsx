"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  name: string;
  givenName: string;
  email: string;
  avatar?: string;
  provider: "google";
  emailVerified?: boolean;
  idToken?: string;
  signedInAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  googleClientId: string;
  setGoogleClientId: (id: string) => void;
  isGoogleLoaded: boolean;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  myPassesOpen: boolean;
  openMyPasses: () => void;
  closeMyPasses: () => void;
  handleGoogleCredential: (credential: string) => Promise<boolean>;
  signOut: () => void;
}

const STORAGE_KEY = "pandey_pg_auth_user";
const CLIENT_ID_KEY = "pandey_pg_google_client_id";

// Safe JWT parser for client fallback
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [googleClientId, setGoogleClientIdState] = useState<string>(() => {
    return (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
  });

  const [loading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [myPassesOpen, setMyPassesOpen] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Restore session from localStorage on client mount (prevents SSR hydration mismatch)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        if (parsed?.email && parsed?.name) {
          setUser(parsed);
        }
      }
      const savedClientId = window.localStorage.getItem(CLIENT_ID_KEY);
      if (savedClientId && savedClientId.trim()) {
        setGoogleClientIdState(savedClientId.trim());
      }
    } catch {
      // Local storage unreadable
    }
  }, []);

  const setGoogleClientId = useCallback((id: string) => {
    const clean = id.trim();
    setGoogleClientIdState(clean);
    try {
      if (clean) {
        window.localStorage.setItem(CLIENT_ID_KEY, clean);
      } else {
        window.localStorage.removeItem(CLIENT_ID_KEY);
      }
    } catch {
      // Ignore
    }
  }, []);

  // Poll for window.google.accounts.id initialization
  useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        setIsGoogleLoaded(true);
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleCredential = useCallback(async (credential: string): Promise<boolean> => {
    try {
      // First verify via server endpoint
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      let authenticatedUser: AuthUser | null = null;
      if (res.ok) {
        const json = await res.json();
        if (json?.ok && json.user) {
          authenticatedUser = {
            ...json.user,
            idToken: credential,
          };
        }
      }

      // Fallback: decode directly if server returned offline response
      if (!authenticatedUser) {
        const payload = parseJwt(credential);
        if (payload?.email) {
          const email = String(payload.email).toLowerCase();
          const name = String(payload.name || email.split("@")[0]);
          authenticatedUser = {
            id: String(payload.sub || `google-${Date.now()}`),
            email,
            name,
            givenName: String(payload.given_name || name.split(" ")[0]),
            avatar: String(payload.picture || ""),
            emailVerified: Boolean(payload.email_verified),
            provider: "google",
            idToken: credential,
            signedInAt: new Date().toISOString(),
          };
        }
      }

      if (authenticatedUser) {
        setUser(authenticatedUser);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
        } catch {
          // Ignore
        }
        setAuthModalOpen(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error("[Auth] Google sign in error:", err);
      return false;
    }
  }, []);

  // Initialize Google Identity Services when Client ID & Google SDK are ready
  useEffect(() => {
    if (!isGoogleLoaded || !googleClientId || typeof window === "undefined") return;
    if (!window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (resp: GoogleCredentialResponse) => {
          if (resp?.credential) {
            void handleGoogleCredential(resp.credential);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: false,
      });
    } catch (err) {
      console.error("[Auth] Google initialization error:", err);
    }
  }, [isGoogleLoaded, googleClientId, handleGoogleCredential]);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    } catch {
      // Ignore
    }
  }, []);

  const openAuthModal = useCallback(() => setAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), []);
  const openMyPasses = useCallback(() => setMyPassesOpen(true), []);
  const closeMyPasses = useCallback(() => setMyPassesOpen(false), []);

  const value = useMemo(
    () => ({
      user,
      loading,
      googleClientId,
      setGoogleClientId,
      isGoogleLoaded,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      myPassesOpen,
      openMyPasses,
      closeMyPasses,
      handleGoogleCredential,
      signOut,
    }),
    [
      user,
      loading,
      googleClientId,
      setGoogleClientId,
      isGoogleLoaded,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      myPassesOpen,
      openMyPasses,
      closeMyPasses,
      handleGoogleCredential,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
