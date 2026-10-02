"use client";

import {
  useState,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api";

import {
  createCheckout,
} from "@/lib/billing";

/*
 * Razorpay Checkout.js is loaded dynamically
 * so the marketing pages stay light.
 */

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

let razorpayScriptPromise: Promise<void> | null =
  null;

function loadRazorpayScript(): Promise<void> {
  if (
    typeof window === "undefined"
  ) {
    return Promise.reject(
      new Error(
        "Payments are only available in the browser."
      )
    );
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise(
    (resolve, reject) => {
      const script =
        document.createElement(
          "script"
        );

      script.src =
        RAZORPAY_SCRIPT_URL;
      script.async = true;

      script.onload = () => {
        resolve();
      };

      script.onerror = () => {
        razorpayScriptPromise =
          null;

        reject(
          new Error(
            "Could not load the payment gateway. Please check your connection and try again."
          )
        );
      };

      document.body.appendChild(
        script
      );
    }
  );

  return razorpayScriptPromise;
}

/* ============================================================
   PLAN CHECKOUT BUTTON
============================================================ */

type PlanCheckoutButtonProps = {
  planCode:
    | "PRO_MONTHLY"
    | "PRO_YEARLY";
  className?: string;
  children: ReactNode;
};

export default function PlanCheckoutButton({
  planCode,
  className,
  children,
}: PlanCheckoutButtonProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);
  const [note, setNote] =
    useState("");

  const handleClick =
    async () => {
      if (loading) {
        return;
      }

      setLoading(true);
      setNote("");

      try {
        /*
         * 1. Create the Razorpay subscription
         *    on the TapQR backend.
         */

        const response =
          await createCheckout(
            planCode
          );

        const checkout =
          response?.data;

        if (
          !checkout?.keyId ||
          !checkout?.subscriptionId
        ) {
          throw new Error(
            "Could not start checkout. Please try again."
          );
        }

        /*
         * 2. Load Checkout.js (once per page).
         */

        await loadRazorpayScript();

        /*
         * 3. Open the Razorpay subscription
         *    checkout.
         */

        const razorpay =
          new window.Razorpay({
            key: checkout.keyId,
            subscription_id:
              checkout.subscriptionId,
            name: "TapQR",
            description:
              checkout.planName ||
              "TapQR Pro subscription",
            theme: {
              color: "#0f172a",
            },

            /*
             * The backend webhook activates
             * the plan, so on success we send
             * the user to billing settings
             * where activation is confirmed.
             */

            handler: () => {
              router.push(
                "/dashboard/payments"
              );
              router.refresh();
            },

            modal: {
              ondismiss: () => {
                setNote(
                  "Payment was not completed. Your plan has not changed."
                );
              },
            },
          });

        razorpay.on(
          "payment.failed",
          () => {
            setNote(
              "The payment failed. No charge was made — please try again."
            );
          }
        );

        razorpay.open();
      } catch (err) {
        /*
         * Already subscribed -> take them
         * to billing settings instead of
         * erroring.
         */

        if (
          err instanceof
            ApiError &&
          err.code ===
            "ALREADY_SUBSCRIBED"
        ) {
          router.push(
            "/dashboard/payments"
          );
          return;
        }

        setNote(
          err instanceof Error
            ? err.message
            : "Could not start checkout. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          void handleClick()
        }
        disabled={loading}
        className={className}
      >
        {loading
          ? "Starting checkout…"
          : children}
      </button>

      {note && (
        <p className="mt-3 text-center text-xs font-medium text-slate-500">
          {note}
        </p>
      )}
    </div>
  );
}
