export const clerkAppearance = {
  variables: {
    colorPrimary: "#0E2A3D",
    colorText: "#0A1320",
    colorTextSecondary: "#5C6770",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#0A1320",
    colorDanger: "#B33A3A",
    colorSuccess: "#1F5C40",
    borderRadius: "14px",
    fontFamily: "var(--font-body)",
    fontSize: "0.95rem",
  },
  elements: {
    rootBox: {
      width: "100%",
    },
    cardBox: {
      width: "100%",
      boxShadow: "0 24px 48px -28px rgba(14,42,61,0.18)",
      borderRadius: "20px",
    },
    card: {
      width: "100%",
      border: "1px solid #E0DACE",
      borderRadius: "20px",
      backgroundColor: "#FFFFFF",
      padding: "2rem 1.75rem",
    },
    headerTitle: {
      fontFamily: "var(--font-display)",
      fontSize: "1.65rem",
      fontWeight: 500,
      letterSpacing: "-0.015em",
      lineHeight: 1.15,
    },
    headerSubtitle: {
      fontSize: "0.92rem",
    },
    socialButtonsBlockButton: {
      borderColor: "#E0DACE",
      borderRadius: "12px",
      fontWeight: 600,
    },
    dividerLine: {
      backgroundColor: "#E0DACE",
    },
    dividerText: {
      color: "#5C6770",
      fontSize: "0.78rem",
    },
    formFieldLabel: {
      color: "#3B4A55",
      fontWeight: 600,
      fontSize: "0.82rem",
    },
    formFieldInput: {
      borderRadius: "12px",
      borderColor: "#E0DACE",
    },
    formButtonPrimary: {
      backgroundImage: "linear-gradient(180deg, #1B4258 0%, #0E2A3D 100%)",
      borderRadius: "999px",
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: 0,
      boxShadow: "0 16px 32px -16px rgba(14,42,61,0.5)",
    },
    footerActionLink: {
      color: "#0E2A3D",
      fontWeight: 600,
    },
  },
} as const;
