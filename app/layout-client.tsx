"use client";

import { usePathname } from "next/navigation";
import Footer from "./components/Footer";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  return (
    <>
      {children}
      {!isAdminPage && <Footer />}
    </>
  );
}
