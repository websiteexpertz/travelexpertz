"use client";

import { usePathname } from "next/navigation";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import GoogleAnalytics from "./components/GoogleAnalytics";
import WhatsAppChat from "./components/WhatsAppChat";

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
      <WhatsAppChat />
      {children}
      {!isAdminPage && !isOwnerPage && <Footer />}
    </>
  );
}
