"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

interface GoogleAuthButtonProps {
  disabled?: boolean;
  onSuccess?: (idToken: string) => void;
  onError?: (message: string) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";
const GOOGLE_SCRIPT_ID = "google-identity-services";

export default function GoogleAuthButton({
  disabled = false,
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const [scriptReady, setScriptReady] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const renderGoogleButton = useCallback(() => {
    if (!clientId) {
      console.error(
        "TapQR: NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing."
      );
      return;
    }

    if (!window.google?.accounts?.id) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.innerHTML = "";

    if (disabled) {
      return;
    }

    try {
      window.google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        width: 420,
      });
    } catch (error) {
      console.error("TapQR Google button render error:", error);
      onError?.("Unable to display Google sign-in.");
    }
  }, [clientId, disabled, onError]);

  const initializeGoogle = useCallback(() => {
    if (!clientId) {
      onError?.("Google Client ID is missing.");
      return;
    }

    if (!window.google?.accounts?.id) {
      return;
    }

    if (!initializedRef.current) {
      window.google.accounts.id.initialize({
        client_id: clientId,

        callback: (response: { credential?: string }) => {
          if (!response?.credential) {
            onError?.(
              "Google did not return a valid credential."
            );
            return;
          }

          onSuccess?.(response.credential);
        },

        auto_select: false,
        cancel_on_tap_outside: true,
      });

      initializedRef.current = true;
    }

    renderGoogleButton();
  }, [clientId, onError, onSuccess, renderGoogleButton]);

  /*
   * Important:
   * When navigating Email -> Back -> Login, the Google script
   * is already loaded. We must detect it ourselves.
   */
  useEffect(() => {
    const checkGoogle = () => {
      if (window.google?.accounts?.id) {
        setScriptReady(true);
        initializeGoogle();
      }
    };

    checkGoogle();

    const timer = window.setTimeout(checkGoogle, 100);
    const timer2 = window.setTimeout(checkGoogle, 400);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(timer2);
    };
  }, [initializeGoogle]);

  useEffect(() => {
    if (!scriptReady) {
      return;
    }

    const timer = window.setTimeout(() => {
      initializeGoogle();
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [scriptReady, initializeGoogle, disabled]);

  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <>
      <Script
        id={GOOGLE_SCRIPT_ID}
        src={GOOGLE_SCRIPT}
        strategy="afterInteractive"
        onReady={() => {
          setScriptReady(true);

          window.setTimeout(() => {
            initializeGoogle();
          }, 50);
        }}
        onError={() => {
          onError?.(
            "Unable to load Google authentication."
          );
        }}
      />

      <div
        ref={containerRef}
        className="flex min-h-[52px] w-full items-center justify-center overflow-hidden"
      />
    </>
  );
}