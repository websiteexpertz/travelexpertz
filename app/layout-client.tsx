"use client";

import { usePathname } from "next/navigation";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import GoogleAnalytics from "./components/GoogleAnalytics";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  const isOwnerPage = pathname?.startsWith("/owner");

  return (
    <>
      <GoogleAnalytics />
      <CookieConsent />
      {children}
      {!isAdminPage && !isOwnerPage && <Footer />}
    </>
  );
}
