/**
 * Footer Component
 */

"use client";

import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  columns?: FooterColumn[];
  copyright?: string;
  socialLinks?: {
    icon: string;
    href: string;
    label: string;
  }[];
}

export const Footer: React.FC<FooterProps> = ({
  columns = [],
  copyright = `© ${new Date().getFullYear()} TravelExpertz. All rights reserved.`,
  socialLinks = [],
}) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Columns */}
        <div className={styles.columns}>
          {columns.map((column) => (
            <div key={column.title} className={styles.column}>
              <h4 className={styles.columnTitle}>{column.title}</h4>
              <ul className={styles.linkList}>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Bottom Section */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>{copyright}</p>
          {socialLinks.length > 0 && (
            <div className={styles.socialLinks}>
              {socialLinks.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  className={styles.socialLink}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
