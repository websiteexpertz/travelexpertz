export default function PrivacyPolicy() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "2rem" }}>
        Privacy Policy
      </h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          1. Introduction
        </h2>
        <p style={{ color: "#555", lineHeight: "1.6" }}>
          TravelExpertz ("we," "us," "our," or "Company") respects the privacy
          of our users ("user" or "you"). This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you visit
          our website.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          2. Information We Collect
        </h2>
        <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "1rem" }}>
          We may collect information about you in a variety of ways. The
          information we may collect on the Site includes:
        </p>
        <ul style={{ color: "#555", lineHeight: "1.8", paddingLeft: "2rem" }}>
          <li>
            <strong>Personal Data:</strong> Email, name, phone number, and other
            information you provide when booking or creating an account.
          </li>
          <li>
            <strong>Device Data:</strong> Browser type, IP address, and device
            identifiers.
          </li>
          <li>
            <strong>Usage Data:</strong> Pages visited, time spent, and actions
            taken on our site.
          </li>
          <li>
            <strong>Analytics Data:</strong> Collected through Google Analytics
            4 with your consent.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          3. Use of Your Information
        </h2>
        <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "1rem" }}>
          Having accurate information about you permits us to provide you with a
          smooth, efficient, and customized experience. Specifically, we may use
          information collected about you via the Site to:
        </p>
        <ul style={{ color: "#555", lineHeight: "1.8", paddingLeft: "2rem" }}>
          <li>Process your bookings and transactions</li>
          <li>Send you promotional communications (with your consent)</li>
          <li>Improve our website and services</li>
          <li>Monitor and analyze trends and usage</li>
          <li>Detect and prevent fraudulent transactions</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          4. Cookie Policy
        </h2>
        <p style={{ color: "#555", lineHeight: "1.6" }}>
          Our website uses cookies and similar tracking technologies to enhance
          your browsing experience. We use:
        </p>
        <ul
          style={{
            color: "#555",
            lineHeight: "1.8",
            paddingLeft: "2rem",
            marginTop: "1rem",
          }}
        >
          <li>
            <strong>Essential Cookies:</strong> Required for basic website
            functionality
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand how you use
            our site (Google Analytics 4)
          </li>
          <li>
            <strong>Functional Cookies:</strong> Remember your preferences
          </li>
          <li>
            <strong>Marketing Cookies:</strong> Used for targeted advertising
            (with consent)
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          5. Google Analytics 4
        </h2>
        <p style={{ color: "#555", lineHeight: "1.6" }}>
          We use Google Analytics 4 to analyze how you use our website. Google
          Analytics collects information such as how often you visit this site,
          what pages you visit when you do so, and what other sites you used
          prior to coming to this site. We use the information we get from
          Google Analytics only to improve this Site. Though Google Analytics
          plants a permanent cookie on your web browser to identify you as a
          unique user the next time you visit this site, the cookie cannot be
          used by anyone but Google. Google's ability to use and share
          information collected by Google Analytics about your visits to this
          Site is restricted by the Google Analytics Terms of Service and the
          Google Privacy Policy.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          6. Google Consent Mode
        </h2>
        <p style={{ color: "#555", lineHeight: "1.6" }}>
          We implement Google Consent Mode v2 to respect your privacy choices.
          By using consent signals, we ensure that your preferences are honored
          across Google's products and services.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          7. Your Rights
        </h2>
        <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "1rem" }}>
          Depending on your location, you may have the following rights:
        </p>
        <ul style={{ color: "#555", lineHeight: "1.8", paddingLeft: "2rem" }}>
          <li>Right to access your personal data</li>
          <li>Right to rectify inaccurate data</li>
          <li>Right to erase your data</li>
          <li>Right to restrict processing</li>
          <li>Right to withdraw consent at any time</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}
        >
          8. Contact Us
        </h2>
        <p style={{ color: "#555", lineHeight: "1.6" }}>
          If you have questions or concerns about this Privacy Policy or our
          privacy practices, please contact us at:
        </p>
        <div style={{ marginTop: "1rem", color: "#555" }}>
          <p>
            <strong>Email:</strong> privacy@travelexpertz.com
          </p>
          <p>
            <strong>Address:</strong> TravelExpertz, [Your Address Here]
          </p>
        </div>
      </section>

      <section>
        <p
          style={{
            color: "#999",
            fontSize: "0.9rem",
            marginTop: "2rem",
            paddingTop: "2rem",
            borderTop: "1px solid #eee",
          }}
        >
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </section>
    </div>
  );
}
