"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EventDetailsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect away from individual event detail page to All Events page
    router.replace("/events");
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        color: "#64748b",
        fontSize: "1rem",
      }}
    >
      Redirecting to events...
    </div>
  );
}
