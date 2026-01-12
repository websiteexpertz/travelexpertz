// Mobile Navigation Menu Component - Responsive Example
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
}

export default function MobileNav({ isOpen, onClose, navItems }: MobileNavProps) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Prevent body scroll when menu is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  if (!isMounted) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`mobile-nav-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <nav
        className={`mobile-nav ${isOpen ? 'open' : ''}`}
        aria-label="Mobile navigation"
      >
        <div className="mobile-nav-header">
          <h2 className="mobile-nav-title">Menu</h2>
          <button
            className="mobile-nav-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ul className="mobile-nav-list">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`mobile-nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                {item.icon && <span className="mobile-nav-icon">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <style jsx>{`
        /* Backdrop */
        .mobile-nav-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: 999;
        }

        .mobile-nav-backdrop.active {
          opacity: 1;
          visibility: visible;
        }

        /* Mobile Navigation */
        .mobile-nav {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(85vw, 400px);
          background: white;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .mobile-nav.open {
          transform: translateX(0);
        }

        /* Header */
        .mobile-nav-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: clamp(1rem, 3vw, 1.5rem);
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
          color: white;
        }

        .mobile-nav-title {
          font-size: clamp(1.25rem, 3vw, 1.5rem);
          font-weight: 700;
          margin: 0;
        }

        .mobile-nav-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .mobile-nav-close:active {
          transform: scale(0.95);
          background: rgba(255, 255, 255, 0.3);
        }

        /* Navigation List */
        .mobile-nav-list {
          list-style: none;
          padding: clamp(0.5rem, 2vw, 1rem);
          margin: 0;
          flex: 1;
        }

        .mobile-nav-list li {
          margin-bottom: clamp(0.25rem, 1vw, 0.5rem);
        }

        /* Navigation Links */
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: clamp(0.75rem, 2vw, 1rem);
          padding: clamp(0.875rem, 2vw, 1rem) clamp(1rem, 3vw, 1.25rem);
          border-radius: 12px;
          color: #374151;
          text-decoration: none;
          font-size: clamp(0.95rem, 2vw, 1.05rem);
          font-weight: 500;
          transition: all 0.2s ease;
          min-height: 48px;
          position: relative;
          overflow: hidden;
        }

        .mobile-nav-link::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #0066cc, #00d4ff);
          transform: scaleY(0);
          transition: transform 0.2s ease;
          border-radius: 0 4px 4px 0;
        }

        .mobile-nav-link:active {
          transform: scale(0.98);
          background: rgba(0, 102, 204, 0.05);
        }

        .mobile-nav-link.active {
          background: rgba(0, 102, 204, 0.1);
          color: #0066cc;
          font-weight: 600;
        }

        .mobile-nav-link.active::before {
          transform: scaleY(1);
        }

        .mobile-nav-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Tablet and above - hide mobile nav */
        @media (min-width: 768px) {
          .mobile-nav,
          .mobile-nav-backdrop {
            display: none;
          }
        }

        /* Very small screens */
        @media (max-width: 374px) {
          .mobile-nav {
            width: 100vw;
          }

          .mobile-nav-link {
            font-size: 0.95rem;
            padding: 0.875rem 1rem;
          }
        }

        /* Landscape mobile */
        @media (max-height: 500px) and (orientation: landscape) {
          .mobile-nav-header {
            padding: 0.75rem 1rem;
          }

          .mobile-nav-title {
            font-size: 1.125rem;
          }

          .mobile-nav-close {
            width: 40px;
            height: 40px;
          }

          .mobile-nav-list {
            padding: 0.5rem;
          }

          .mobile-nav-link {
            padding: 0.75rem 1rem;
            min-height: 44px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .mobile-nav,
          .mobile-nav-backdrop,
          .mobile-nav-link,
          .mobile-nav-close {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}

/* Hamburger Menu Button Component */
export function HamburgerButton({ 
  isOpen, 
  onClick 
}: { 
  isOpen: boolean; 
  onClick: () => void 
}) {
  return (
    <>
      <button
        className={`hamburger ${isOpen ? 'open' : ''}`}
        onClick={onClick}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      <style jsx>{`
        .hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 6px;
          width: 44px;
          height: 44px;
          background: transparent;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
          position: relative;
          z-index: 1001;
        }

        .hamburger:hover {
          border-color: #0066cc;
          background: rgba(0, 102, 204, 0.05);
        }

        .hamburger:active {
          transform: scale(0.95);
        }

        .hamburger-line {
          width: 20px;
          height: 2px;
          background: #374151;
          border-radius: 2px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .hamburger.open .hamburger-line:nth-child(1) {
          transform: rotate(45deg) translate(7px, 7px);
          background: #0066cc;
        }

        .hamburger.open .hamburger-line:nth-child(2) {
          opacity: 0;
          transform: translateX(-20px);
        }

        .hamburger.open .hamburger-line:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -7px);
          background: #0066cc;
        }

        .hamburger.open {
          border-color: #0066cc;
          background: white;
        }

        /* Show on mobile and tablet */
        @media (max-width: 767px) {
          .hamburger {
            display: flex;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .hamburger,
          .hamburger-line {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
