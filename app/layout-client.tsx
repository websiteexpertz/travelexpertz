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

  // Hero pages that should NOT have top spacing (navbar overlays content)
  const heroPages = ["/", "/home", "/hotels", "/homestays", "/packages"];
  const isHeroPage = heroPages.includes(pathname || "");

  // Apply navbar spacing to all non-hero pages
  const shouldApplySpacing = !isHeroPage;

  return (
    <>
      <GoogleAnalytics />
      <CookieConsent />
      <WhatsAppChat />

      <div className={shouldApplySpacing ? "navbar-spacing-wrapper" : ""}>
        {children}
      </div>

      {!isAdminPage && !isOwnerPage && <Footer />}
    </>
  );
}
