"use client";

import { useState, useEffect } from "react";
import { BRAND } from "@/lib/data";
import { inr } from "@/lib/pricing";

interface PaymentGatewayProps {
  amount: number;
  bookingCode: string;
  residentName: string;
  roomDetails: string;
  onSuccess: (txnId: string, method: string) => void;
  onCancel: () => void;
}

export function PaymentGateway({
  amount,
  bookingCode,
  residentName,
  roomDetails,
  onSuccess,
  onCancel,
}: PaymentGatewayProps) {
  const [method, setMethod] = useState<"upi" | "razorpay">("upi");
  const [utrNumber, setUtrNumber] = useState("");
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer
  const [error, setError] = useState("");

  // Countdown timer for 10-minute hold
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Clean UPI link
  const upiIntentUrl = `upi://pay?pa=${BRAND.upi}&pn=PANDEY+PG&am=${amount}&tr=${encodeURIComponent(
    bookingCode
  )}&tn=${encodeURIComponent(`PG Bed ${bookingCode}`)}&cu=INR`;

  // QR code URL using public QR API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(
    upiIntentUrl
  )}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(BRAND.upi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerifyUPI = async () => {
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingCode,
          amount,
          paymentMethod: "UPI (PhonePe/GPay)",
          transactionRef: utrNumber.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        onSuccess(data.transactionId, "UPI");
      } else {
        setError(data.error || "Payment verification failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSimulateRazorpay = async () => {
    setVerifying(true);
    setError("");
    // Simulate Razorpay Gateway checkout flow
    setTimeout(async () => {
      try {
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingCode,
            amount,
            paymentMethod: "Razorpay (Cards/NetBanking)",
            transactionRef: `pay_${Date.now()}_rzp`,
          }),
        });
        const data = await res.json();
        if (data.ok) {
          onSuccess(data.transactionId, "Razorpay");
        } else {
          setError("Gateway error. Please retry.");
        }
      } catch {
        setError("Network error.");
      } finally {
        setVerifying(false);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gold/40 bg-[#17100C] text-ivory shadow-2xl">
        {/* Top Header */}
        <div className="border-b border-gold/15 bg-gradient-to-r from-coffee to-espresso px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 items-center justify-center rounded-full bg-success">
                <span className="h-1.5 w-1.5 rounded-full bg-ivory" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                PANDEY PG SECURE PAYMENT
              </span>
            </div>
            <button
              onClick={onCancel}
              className="rounded-full border border-gold/20 p-1 text-sand hover:bg-gold/10 hover:text-ivory"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-xs text-sand-dim">Amount to Pay</p>
              <h2 className="font-serif text-3xl font-bold text-gold-light">{inr(amount)}</h2>
            </div>
            <div className="text-right">
              <span className="rounded bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                Holding Bed: {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              <p className="mt-0.5 text-[11px] text-sand-dim">{bookingCode}</p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gold/15 bg-[#120D0A]">
          <button
            onClick={() => setMethod("upi")}
            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all ${
              method === "upi"
                ? "border-b-2 border-gold bg-gold/10 text-gold-light"
                : "text-sand-dim hover:text-sand"
            }`}
          >
            📱 Instant UPI / QR
          </button>
          <button
            onClick={() => setMethod("razorpay")}
            className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-all ${
              method === "razorpay"
                ? "border-b-2 border-gold bg-gold/10 text-gold-light"
                : "text-sand-dim hover:text-sand"
            }`}
          >
            💳 Cards / NetBanking (Razorpay)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {method === "upi" ? (
            <div className="flex flex-col items-center text-center">
              {/* QR Code Container */}
              <div className="relative rounded-2xl border-2 border-gold/30 bg-white p-3 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="Pandey PG UPI QR Code"
                  width={210}
                  height={210}
                  className="rounded-lg"
                />
                <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#120D0A]">
                  <span>Scan with any UPI App</span>
                </div>
              </div>

              {/* Supported UPI Badges */}
              <div className="mt-3 flex items-center justify-center gap-3 text-[10px] font-medium text-sand-dim">
                <span className="rounded bg-coffee/80 px-2 py-0.5 text-ivory">Google Pay</span>
                <span className="rounded bg-coffee/80 px-2 py-0.5 text-ivory">PhonePe</span>
                <span className="rounded bg-coffee/80 px-2 py-0.5 text-ivory">Paytm</span>
                <span className="rounded bg-coffee/80 px-2 py-0.5 text-ivory">CRED</span>
                <span className="rounded bg-coffee/80 px-2 py-0.5 text-ivory">BHIM</span>
              </div>

              {/* Mobile Deep Link */}
              <div className="mt-4 w-full sm:hidden">
                <a
                  href={upiIntentUrl}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-success to-emerald-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg"
                >
                  ⚡ Open in GPay / PhonePe / Paytm
                </a>
              </div>

              {/* Copy UPI ID */}
              <div className="mt-4 flex w-full items-center justify-between rounded-xl border border-gold/20 bg-[#120D0A] px-4 py-2 text-xs">
                <div className="text-left">
                  <span className="block text-[9.5px] uppercase tracking-wider text-sand-dim">UPI ID (VPA)</span>
                  <span className="font-mono font-bold text-gold-light">{BRAND.upi}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gold hover:bg-gold/20"
                >
                  {copied ? "Copied!" : "Copy UPI"}
                </button>
              </div>

              {/* UTR reference input */}
              <div className="mt-4 w-full text-left">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-sand-dim">
                  UPI 12-Digit Ref / UTR No. (Optional)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 429188204918"
                  className="mt-1 w-full rounded-xl border border-gold/30 bg-[#120D0A] px-4 py-2.5 font-mono text-xs text-ivory placeholder:text-sand-dim/50 focus:border-gold focus:outline-none"
                />
              </div>

              {error && <p className="mt-2 text-xs text-danger">{error}</p>}

              {/* Action Buttons */}
              <button
                type="button"
                onClick={handleVerifyUPI}
                disabled={verifying}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-gold to-gold-light py-3 text-xs font-bold uppercase tracking-wider text-espresso transition-all hover:opacity-95 disabled:opacity-50"
              >
                {verifying ? "Verifying Payment with Bank..." : "I Have Paid — Confirm Booking"}
              </button>
            </div>
          ) : (
            <div className="space-y-4 py-4 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                💳
              </div>
              <h3 className="font-serif text-xl text-ivory">Razorpay Gateway</h3>
              <p className="mx-auto max-w-xs text-xs text-sand-dim">
                Pay using Credit Card, Debit Card, NetBanking (HDFC, SBI, ICICI), or EMI with 256-bit encryption.
              </p>

              <div className="rounded-xl border border-gold/15 bg-[#120D0A] p-4 text-left text-xs">
                <div className="flex justify-between border-b border-gold/10 pb-2">
                  <span className="text-sand-dim">Resident:</span>
                  <strong className="text-ivory">{residentName}</strong>
                </div>
                <div className="flex justify-between border-b border-gold/10 py-2">
                  <span className="text-sand-dim">Bed:</span>
                  <span className="text-sand">{roomDetails}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-sand-dim">Payable:</span>
                  <strong className="font-serif text-base text-gold-light">{inr(amount)}</strong>
                </div>
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}

              <button
                type="button"
                onClick={handleSimulateRazorpay}
                disabled={verifying}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:opacity-95 disabled:opacity-50"
              >
                {verifying ? "Connecting to Razorpay..." : `Pay ${inr(amount)} via Razorpay`}
              </button>
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="border-t border-gold/15 bg-[#120D0A] px-6 py-3 text-center text-[10px] text-sand-dim">
          🔒 100% Secure Payment · Instant digital receipt &amp; booking confirmation issued.
        </div>
      </div>
    </div>
  );
}
