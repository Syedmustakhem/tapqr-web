"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

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

const GOOGLE_SCRIPT =
  "https://accounts.google.com/gsi/client";

export default function GoogleAuthButton({
  disabled = false,
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const [scriptLoaded, setScriptLoaded] = useState(false);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const renderGoogleButton = () => {
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

    window.google.accounts.id.renderButton(
      container,
      {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        width: 420,
      }
    );
  };

  const initializeGoogle = () => {
    if (!clientId) {
      onError?.(
        "Google Client ID is missing."
      );
      return;
    }

    if (!window.google?.accounts?.id) {
      return;
    }

    if (!initializedRef.current) {
      window.google.accounts.id.initialize({
        client_id: clientId,

        callback: (response: {
          credential?: string;
        }) => {
          if (!response?.credential) {
            onError?.(
              "Google did not return a valid credential."
            );
            return;
          }

          onSuccess?.(
            response.credential
          );
        },

        auto_select: false,
        cancel_on_tap_outside: true,
      });

      initializedRef.current = true;
    }

    renderGoogleButton();
  };

  useEffect(() => {
    if (!scriptLoaded) {
      return;
    }

    const timer = window.setTimeout(() => {
      initializeGoogle();
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [scriptLoaded, disabled]);

  useEffect(() => {
    if (!scriptLoaded || disabled) {
      return;
    }

    const timer = window.setTimeout(() => {
      renderGoogleButton();
    }, 200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [scriptLoaded, disabled]);

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
        src={GOOGLE_SCRIPT}
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true);
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