// Modern Header Styles with Responsive Design
export const headerStyles = {
  header: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
    animation: 'slideInDown 0.4s ease-out',
  },
  
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 2rem)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'clamp(1rem, 2vw, 2rem)',
    flexWrap: 'wrap' as const,
  },
  
  containerMobile: {
    padding: '0.75rem 1rem',
    gap: '1rem',
  },
  
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    transition: 'transform 0.3s ease',
    fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
  },
  
  logoHover: {
    transform: 'scale(1.05)',
  },
  
  nav: {
    display: 'flex',
    gap: 'clamp(1rem, 2vw, 2.5rem)',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  
  navMobile: {
    flexDirection: 'column' as const,
    width: '100%',
    gap: '0.5rem',
    padding: '1rem 0',
  },
  
  navLink: {
    fontSize: 'clamp(0.875rem, 1.5vw, 0.95rem)',
    fontWeight: 500,
    color: '#374151',
    textDecoration: 'none',
    position: 'relative' as const,
    padding: '0.5rem 0',
    transition: 'all 0.3s ease',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
  },
  
  navLinkActive: {
    color: '#0066cc',
    fontWeight: 600,
  },
  
  navLinkHover: {
    color: '#0066cc',
    transform: 'translateY(-2px)',
  },
  
  navLinkUnderline: {
    content: '""',
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, #0066cc, #00d4ff)',
    transform: 'scaleX(1)',
    transformOrigin: 'left',
    borderRadius: '2px',
  },
  
  authButtons: {
    display: 'flex',
    gap: 'clamp(0.5rem, 1vw, 1rem)',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  
  authButtonsMobile: {
    width: '100%',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  
  loginButton: {
    padding: 'clamp(0.5rem, 1.5vw, 0.625rem) clamp(1rem, 2vw, 1.75rem)',
    background: 'transparent',
    color: '#0066cc',
    border: '2px solid #0066cc',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: 'clamp(0.875rem, 1.5vw, 0.95rem)',
    fontWeight: 600,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    minHeight: '44px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap' as const,
  },
  
  loginButtonMobile: {
    width: '100%',
    padding: '0.75rem 1rem',
  },
  
  loginButtonHover: {
    background: '#0066cc',
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0, 102, 204, 0.3)',
  },
  
  signupButton: {
    padding: 'clamp(0.5rem, 1.5vw, 0.625rem) clamp(1rem, 2vw, 1.75rem)',
    background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: 'clamp(0.875rem, 1.5vw, 0.95rem)',
    fontWeight: 600,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.2)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    minHeight: '44px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap' as const,
  },
  
  signupButtonMobile: {
    width: '100%',
    padding: '0.75rem 1rem',
  },
  
  signupButtonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(0, 102, 204, 0.35)',
  },
  
  userMenu: {
    position: 'relative' as const,
  },
  
  userMenuButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 1.5rem',
    background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.2)',
  },
  
  userMenuButtonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(0, 102, 204, 0.3)',
  },
  
  dropdown: {
    position: 'absolute' as const,
    top: 'calc(100% + 1rem)',
    right: 0,
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
    minWidth: '220px',
    overflow: 'hidden' as const,
    animation: 'scaleIn 0.3s ease-out',
    border: '1px solid rgba(0, 0, 0, 0.05)',
  },
  
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    fontSize: '0.95rem',
    color: '#374151',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },
  
  dropdownItemHover: {
    background: 'rgba(0, 102, 204, 0.05)',
    color: '#0066cc',
    paddingLeft: '1.5rem',
  },
  
  dropdownItemLast: {
    borderBottom: 'none',
    color: '#ef4444',
  },
};

// Modern Card Styles with Responsive Design
export const cardStyles = {
  card: {
    background: 'white',
    borderRadius: 'clamp(12px, 2vw, 16px)',
    padding: 'clamp(1rem, 2vw, 1.5rem)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  },
  
  cardMobile: {
    borderRadius: '12px',
    padding: '1rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },
  
  cardHover: {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
    borderColor: 'rgba(0, 102, 204, 0.2)',
  },
  
  cardHoverMobile: {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
  },
};

// Modern Form Styles with Responsive Design
export const formStyles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)',
    padding: 'clamp(1rem, 3vw, 3rem) clamp(0.75rem, 2vw, 1rem)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  card: {
    background: 'white',
    borderRadius: 'clamp(16px, 2vw, 20px)',
    padding: 'clamp(1.5rem, 4vw, 3rem)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.1)',
    maxWidth: '480px',
    width: '100%',
    animation: 'scaleIn 0.5s ease-out',
  },
  
  cardMobile: {
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.08)',
  },
  
  title: {
    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
    fontWeight: 700,
    textAlign: 'center' as const,
    marginBottom: 'clamp(0.5rem, 1vw, 0.5rem)',
    background: 'linear-gradient(135deg, #0066cc 0%, #00d4ff 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  
  subtitle: {
    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
    color: '#6b7280',
    textAlign: 'center' as const,
    marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
  },
  
  inputGroup: {
    marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
  },
  
  label: {
    display: 'block',
    fontSize: 'clamp(0.875rem, 1.5vw, 0.95rem)',
    fontWeight: 600,
    color: '#374151',
    marginBottom: 'clamp(0.375rem, 1vw, 0.5rem)',
  },
  
  input: {
    width: '100%',
    padding: 'clamp(0.75rem, 2vw, 0.875rem) clamp(0.875rem, 2vw, 1rem)',
    border: '2px solid #e5e7eb',
    borderRadius: 'clamp(10px, 1.5vw, 12px)',
    fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
    transition: 'all 0.3s ease',
    background: 'white',
    minHeight: '44px',
  },
  
  inputMobile: {
    fontSize: '16px', /* Prevents zoom on iOS */
    padding: '0.875rem 1rem',
  },
  
  inputFocus: {
    outline: 'none',
    borderColor: '#0066cc',
    boxShadow: '0 0 0 4px rgba(0, 102, 204, 0.1)',
    transform: 'translateY(-1px)',
  },
  
  button: {
    width: '100%',
    padding: 'clamp(0.875rem, 2vw, 1rem)',
    background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 20px rgba(0, 102, 204, 0.25)',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  
  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 30px rgba(0, 102, 204, 0.35)',
  },
  
  buttonDisabled: {
    background: '#9ca3af',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  
  alert: {
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
    fontWeight: 500,
    animation: 'slideInDown 0.3s ease-out',
  },
  
  alertError: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#991b1b',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  
  alertSuccess: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#065f46',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
};

// Badge Styles
export const badgeStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.375rem 0.875rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  
  success: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#065f46',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  
  warning: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#92400e',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  },
  
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#991b1b',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  
  primary: {
    background: 'rgba(0, 102, 204, 0.1)',
    color: '#0052a3',
    border: '1px solid rgba(0, 102, 204, 0.2)',
  },
};
