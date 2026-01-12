/**
 * Modal Component - Reusable modal dialog
 */

"use client";

import React, { useEffect } from "react";
import styles from "./Modal.module.css";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = "medium",
  children,
  footer,
  closeButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} role="presentation" />
      <div className={styles.overlay}>
        <div className={`${styles.modal} ${styles[size]}`}>
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            {closeButton && (
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close modal"
              >
                ✕
              </button>
            )}
          </div>

          {/* Content */}
          <div className={styles.content}>{children}</div>

          {/* Footer */}
          {footer && <div className={styles.footer}>{footer}</div>}
        </div>
      </div>
    </>
  );
};

export default Modal;
