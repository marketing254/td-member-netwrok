export const clerkAppearance = {
  variables: {
    colorPrimary: "#0E2A3D",
    colorText: "#0A1320",
    colorTextSecondary: "#5C6770",
    colorBackground: "#FFFFFF",
    colorInputBackground: "#FCFBF8",
    colorInputText: "#0A1320",
    borderRadius: "18px",
    fontFamily: "var(--font-body)",
  },
  elements: {
    rootBox: {
      width: "100%",
    },
    cardBox: {
      width: "100%",
      boxShadow: "none",
    },
    card: {
      width: "100%",
      boxShadow: "none",
      border: "1px solid #E0DACE",
      borderRadius: "24px",
    },
    headerTitle: {
      color: "#0A1320",
      fontFamily: "var(--font-display)",
      fontSize: "1.8rem",
      fontWeight: "600",
    },
    headerSubtitle: {
      color: "#5C6770",
    },
    socialButtonsBlockButton: {
      borderColor: "#E0DACE",
      color: "#0A1320",
    },
    formButtonPrimary: {
      backgroundColor: "#0E2A3D",
      backgroundImage: "linear-gradient(180deg, #1B4258 0%, #0E2A3D 100%)",
      borderRadius: "999px",
      boxShadow: "0 20px 36px -18px rgba(14,42,61,0.5)",
    },
    formFieldLabel: {
      color: "#3B4A55",
      fontWeight: "600",
    },
    formFieldInput: {
      borderRadius: "16px",
    },
    otpCodeFieldInput: {
      borderRadius: "16px",
    },
    footerActionLink: {
      color: "#0E2A3D",
      fontWeight: "600",
    },
    dividerLine: {
      backgroundColor: "#E0DACE",
    },
  },
} as const;
