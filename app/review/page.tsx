"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VerifiedReviewForm from "@/components/reviews/VerifiedReviewForm";

function ReviewContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || undefined;
  const bookingId = searchParams.get("bookingId") || undefined;

  return <VerifiedReviewForm initialToken={token} initialBookingId={bookingId} />;
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}
