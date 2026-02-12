import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "600px",
          background: "white",
          borderRadius: "20px",
          padding: "3rem 2rem",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* 404 Number */}
        <div
          style={{
            fontSize: "7rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 1rem",
            lineHeight: 1,
          }}
        >
          404
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#1f2937",
            margin: "0 0 1rem",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Page Not Found
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "1.1rem",
            color: "#6b7280",
            margin: "0 0 2rem",
            lineHeight: 1.6,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Sorry! It looks like you've wandered off the beaten path. The page
          you're looking for doesn't exist or has been moved.
        </p>

        {/* Decorative Icon */}
        <div
          style={{
            fontSize: "4rem",
            margin: "2rem 0",
            opacity: 0.5,
          }}
        >
          ✈️
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            margin: "2rem 0",
          }}
        >
          <Link href="/">
            <button
              style={{
                padding: "0.75rem 2rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              🏠 Back to Home
            </button>
          </Link>

          <Link href="/packages">
            <button
              style={{
                padding: "0.75rem 2rem",
                background: "white",
                color: "#667eea",
                border: "2px solid #667eea",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              📦 Explore Packages
            </button>
          </Link>
        </div>

        {/* Quick Links */}
        <div
          style={{
            marginTop: "2rem",
            paddingTop: "2rem",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <p
            style={{
              fontSize: "0.9rem",
              color: "#9ca3af",
              margin: "0 0 1rem",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            You might also want to visit:
          </p>
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/hotels">
              <span
                style={{
                  color: "#667eea",
                  cursor: "pointer",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "color 0.2s",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                🏨 Hotels
              </span>
            </Link>
            <Link href="/services">
              <span
                style={{
                  color: "#667eea",
                  cursor: "pointer",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "color 0.2s",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                🎫 Services
              </span>
            </Link>
            <Link href="/about">
              <span
                style={{
                  color: "#667eea",
                  cursor: "pointer",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "color 0.2s",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                ℹ️ About Us
              </span>
            </Link>
          </div>
        </div>

        {/* Support Message */}
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "#f3f4f6",
            borderRadius: "10px",
            fontSize: "0.9rem",
            color: "#6b7280",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <p style={{ margin: 0 }}>
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@travelexpertz.com"
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              support@travelexpertz.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
