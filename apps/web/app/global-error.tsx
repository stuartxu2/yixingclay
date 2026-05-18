"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          background: "#fcfaf2",
          color: "#1e1915",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <p style={{ fontSize: 12, letterSpacing: "0.12em", color: "#8c7b72", textTransform: "uppercase" }}>
          Something went wrong
        </p>
        <h1 style={{ margin: "16px 0 8px", fontSize: "clamp(32px,5vw,56px)", fontWeight: 300, letterSpacing: "-0.02em" }}>
          The kiln misfired.
        </h1>
        <p style={{ maxWidth: 360, fontSize: 15, fontWeight: 300, color: "#6b5c53", lineHeight: 1.6 }}>
          An unexpected error occurred. Our team has been notified — please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 32,
            padding: "14px 32px",
            background: "#1e1915",
            color: "#fcfaf2",
            border: "none",
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: "0.04em",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{ marginTop: 12, fontSize: 13, color: "#8c7b72", textDecoration: "underline" }}
        >
          Go home
        </a>
      </body>
    </html>
  );
}
