"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer>
      <div className="footer-container">
        {/* Top wave separator */}
        <div className="footer-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path
              d="M0,0 C360,60 1080,0 1440,50 L1440,60 L0,60 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <h2>
              <Image
                src="/logo.webp"
                alt="TravelExpertz"
                width={120}
                height={120}
                className="footer-logo-img"
              />
            </h2>
            <p>
              Your trusted partner in creating unforgettable travel experiences
              across India and beyond.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path
                    clipRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    fillRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" aria-label="Twitter">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path
                    clipRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.795 2.013 10.148 2 12.315 2zm-1.163 1.943c-1.049.045-1.71.218-2.227.427A3.396 3.396 0 006.944 6.944c-.21.517-.382 1.178-.427 2.227-.045 1.025-.058 1.35-.058 3.829s.013 2.803.058 3.829c.045 1.049.218 1.71.427 2.227a3.396 3.396 0 002.373 2.373c.517.21.98.382 2.227.427 1.025.045 1.35.058 3.829.058s2.803-.013 3.829-.058c1.049-.045 1.71-.218 2.227-.427a3.396 3.396 0 002.373-2.373c.21-.517.382-1.178.427-2.227.045-1.025.058-1.35.058-3.829s-.013-2.803-.058-3.829c-.045-1.049-.218-1.71-.427-2.227a3.396 3.396 0 00-2.373-2.373c-.517-.21-1.178-.382-2.227-.427C15.118 3.956 14.789 3.943 12.315 3.943h-1.163zM12 8.118c-2.147 0-3.882 1.735-3.882 3.882s1.735 3.882 3.882 3.882 3.882-1.735 3.882-3.882S14.147 8.118 12 8.118zm0 6.162c-1.258 0-2.28-1.022-2.28-2.28s1.022-2.28 2.28-2.28 2.28 1.022 2.28 2.28-1.022 2.28-2.28 2.28zm4.965-6.402c-.78 0-1.418.638-1.418 1.418s.638 1.418 1.418 1.418 1.418-.638 1.418-1.418-.638-1.418-1.418-1.418z"
                    fillRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" aria-label="YouTube">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a2.994 2.994 0 00-2.107-2.117C19.525 3.5 12 3.5 12 3.5s-7.525 0-9.391.569A2.994 2.994 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.994 2.994 0 002.107 2.117C4.475 20.5 12 20.5 12 20.5s7.525 0 9.391-.569a2.994 2.994 0 002.107-2.117C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul className="footer-links">
              <li>
                <a href="/about">About Us</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
              <li>
                <a href="#">Press</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul className="footer-links">
              <li>
                <a href="#">Contact Us</a>
              </li>
              <li>
                <a href="#">FAQ</a>
              </li>
              <li>
                <a href="#">Help Center</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Destinations</h4>
            <ul className="footer-links">
              <li>
                <a href="#">States/Regions</a>
              </li>
              <li>
                <a href="#">Cities</a>
              </li>
              <li>
                <a href="#">Top Hotels</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li>
                <a href="/privacy-policy">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} TravelExpertz. All rights reserved.
          </p>
          <p className="footer-tagline">
            Made with ❤️ for travelers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
