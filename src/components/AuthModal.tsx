"use client";

import { useEffect, useRef, useState } from "react";
import { Modal, ModalShell, Button } from "./ui";
import { GoogleIcon } from "./GoogleIcon";
import { Icon } from "./Icon";
import { useAuth } from "@/context/AuthContext";

export function AuthModal() {
  const {
    authModalOpen,
    closeAuthModal,
    googleClientId,
    setGoogleClientId,
    isGoogleLoaded,
  } = useAuth();

  const [inputClientId, setInputClientId] = useState(googleClientId);
  const [showConfig, setShowConfig] = useState(!googleClientId);
  const [error, setError] = useState("");
  const [prevClientId, setPrevClientId] = useState(googleClientId);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  if (googleClientId !== prevClientId) {
    setPrevClientId(googleClientId);
    if (googleClientId) {
      setInputClientId(googleClientId);
      setShowConfig(false);
    }
  }

  // Render official Google button into the container when ready
  useEffect(() => {
    if (!authModalOpen) return;
    if (!isGoogleLoaded || !googleClientId || typeof window === "undefined") return;
    if (!window.google?.accounts?.id || !buttonContainerRef.current) return;

    try {
      buttonContainerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(buttonContainerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 320,
      });
    } catch (err) {
      console.error("[Google Auth] Error rendering Google button:", err);
    }
  }, [authModalOpen, isGoogleLoaded, googleClientId]);

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputClientId.trim();
    if (!clean) {
      setError("Please enter a valid Google OAuth Client ID.");
      return;
    }
    if (!clean.includes(".apps.googleusercontent.com") && clean.length < 20) {
      setError("Client ID usually ends with '.apps.googleusercontent.com'.");
      return;
    }
    setError("");
    setGoogleClientId(clean);
    setShowConfig(false);
  };

  return (
    <Modal
      open={authModalOpen}
      onClose={closeAuthModal}
      ariaLabel="Official Google Authentication"
      className="max-w-lg"
    >
      <ModalShell
        title="Official Google Sign-In"
        subtitle="Sign in securely with your Google Account."
        onClose={closeAuthModal}
      >
        <div className="space-y-6">
          {/* Security header */}
          <div className="flex items-start gap-3.5 rounded-xl border border-gold/20 bg-gradient-to-br from-gold/15 to-transparent p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-gold/30 bg-espresso">
              <GoogleIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-gold-light">
                Google OAuth 2.0 Identity Service
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-sand">
                Authenticates directly via Google Accounts. Your identity, email, and resident profile are verified cryptographically and remembered on this device.
              </p>
            </div>
          </div>

          {/* If Google Client ID is configured: Show Official Google Button */}
          {googleClientId && !showConfig ? (
            <div className="space-y-5 py-2">
              <div className="rounded-2xl border border-gold/20 bg-espresso/60 p-6 text-center">
                <p className="text-[11px] font-bold uppercase tracking-luxe text-gold">
                  Google Verification Ready
                </p>
                <p className="mt-1 text-[12.5px] text-sand">
                  Click the button below to authorize with your real Google account:
                </p>

                {/* Official Google Identity Button rendered directly by Google SDK */}
                <div className="mt-5 flex justify-center">
                  <div
                    ref={buttonContainerRef}
                    id="google-official-btn"
                    className="flex min-h-[44px] min-w-[320px] justify-center overflow-hidden rounded-lg"
                  />
                </div>

                {!isGoogleLoaded ? (
                  <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-sand-dim">
                    <span className="h-3 w-3 animate-spin rounded-full border border-gold border-t-transparent" />
                    Connecting to Google Identity Services…
                  </p>
                ) : null}
              </div>

              <div className="flex items-center justify-between border-t border-gold/12 pt-3 text-[11px] text-sand-dim">
                <span className="truncate max-w-[260px]">Client ID: {googleClientId.slice(0, 18)}…</span>
                <button
                  type="button"
                  onClick={() => setShowConfig(true)}
                  className="font-medium text-gold hover:underline"
                >
                  Change Client ID
                </button>
              </div>
            </div>
          ) : (
            /* Setup / Configuration Form for Google OAuth Client ID */
            <form onSubmit={handleSaveClientId} className="space-y-4">
              <div className="rounded-xl border border-gold/20 bg-espresso/60 p-4">
                <div className="flex items-center gap-2 text-gold">
                  <Icon name="key" className="h-4 w-4" />
                  <p className="text-[11.5px] font-bold uppercase tracking-[0.12em]">
                    Connect Your Google Client ID
                  </p>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-sand">
                  To authenticate against real Google Accounts on <code className="text-gold-light">http://localhost:3000</code>, enter your Web OAuth 2.0 Client ID from Google Cloud Console.
                </p>

                <div className="mt-4 space-y-2 text-[11.5px] text-sand-dim">
                  <p className="font-semibold text-ivory">Quick Setup (2 minutes):</p>
                  <ol className="list-decimal space-y-1 pl-4">
                    <li>
                      Open{" "}
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noreferrer"
                        className="text-gold underline hover:text-gold-light"
                      >
                        Google Cloud Console → Credentials
                      </a>
                    </li>
                    <li>Create an <strong>OAuth 2.0 Client ID</strong> (Application type: <em>Web application</em>).</li>
                    <li>Add <code className="text-gold-light">http://localhost:3000</code> to <strong>Authorized JavaScript origins</strong>.</li>
                    <li>Copy your <strong>Client ID</strong> and paste it below:</li>
                  </ol>
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-[0.14em] text-sand-dim">
                  Google Client ID <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1234567890-abcdef.apps.googleusercontent.com"
                  value={inputClientId}
                  onChange={(e) => {
                    setInputClientId(e.target.value);
                    setError("");
                  }}
                  className="mt-1.5 w-full rounded-xl border border-gold/20 bg-espresso/80 px-4 py-2.5 text-[12.5px] font-mono text-ivory outline-none transition-colors placeholder:text-sand-dim/50 focus:border-gold"
                />
              </div>

              {error ? (
                <p className="flex items-center gap-1.5 text-[11.5px] text-danger">
                  <Icon name="alert" className="h-3.5 w-3.5" />
                  {error}
                </p>
              ) : null}

              <div className="flex gap-2.5">
                {googleClientId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowConfig(false)}
                  >
                    Cancel
                  </Button>
                ) : null}
                <Button type="submit" block className="gap-2">
                  <GoogleIcon className="h-4 w-4" />
                  Save &amp; Activate Google Login
                </Button>
              </div>

              <p className="text-center text-[10.5px] text-sand-dim">
                You can also add <code className="text-gold">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in your <code className="text-gold">.env.local</code> file.
              </p>
            </form>
          )}
        </div>
      </ModalShell>
    </Modal>
  );
}
