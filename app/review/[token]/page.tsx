import React from "react";
import VerifiedReviewForm from "@/components/reviews/VerifiedReviewForm";

export const metadata = {
  title: "Share Your Experience | Yatra Expertz",
  description: "Submit a verified guest review for your completed stay with Yatra Expertz.",
};

export default async function ReviewTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <VerifiedReviewForm initialToken={token} />;
}
