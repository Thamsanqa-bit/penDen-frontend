import React from "react";
import { FaFacebook } from "react-icons/fa";

const Footer = () => {
  const styles = {
    footerContainer: {
      background: "#f9f9f9",       // Light white background
      color: "#333",
      padding: "2rem 1rem 1.5rem",
      fontFamily: "'Segoe UI', 'Roboto', Arial, sans-serif",
      borderTop: "1px solid #ddd",
      width: "100%",
      marginTop: "auto",
      boxSizing: "border-box",
    },

    footerContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 0.5rem",
    },

    footerSection: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingBottom: "1.5rem",
      borderBottom: "1px solid #e0e0e0",
      marginBottom: "1.5rem",
      flexDirection: "row",
    },

    poweredBy: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      marginBottom: "1.5rem",
      minWidth: "200px",
    },

    poweredText: {
      fontSize: "0.85rem",
      color: "#777",
      letterSpacing: "0.5px",
      marginBottom: "0.3rem",
    },

    companyName: {
      fontSize: "2rem",
      fontWeight: "700",
      color: "#333",
      letterSpacing: "1px",
      lineHeight: "1.2",
    },

    addressSection: {
      maxWidth: "280px",
      backgroundColor: "#ffffff",
      padding: "1rem 1.2rem",
      borderRadius: "8px",
      borderLeft: "3px solid #999",
      marginTop: "0",
    },

    addressTitle: {
      fontSize: "1rem",
      fontWeight: "600",
      marginBottom: "0.8rem",
      color: "#333",
    },

    addressText: {
      lineHeight: "1.6",
      color: "#555",
      fontSize: "0.9rem",
      margin: "0",
    },

    footerBottom: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "0.5rem",
    },

    copyright: {
      color: "#555",
      fontSize: "0.85rem",
      margin: "0.5rem 0",
      flex: "1",
      minWidth: "250px",
    },

    footerLinks: {
      display: "flex",
      gap: "1rem",
      flexWrap: "wrap",
      justifyContent: "flex-end",
    },

    footerLink: {
      color: "#444",
      textDecoration: "none",
      fontSize: "0.85rem",
      transition: "all 0.3s ease",
    },

    iconRow: {
      display: "flex",
      gap: "15px",
      marginTop: "15px",
      alignItems: "center",
    },

    icon: {
      fontSize: "1.5rem",
      color: "#1877F2", // Facebook Blue
      cursor: "pointer",
      transition: "0.3s",
    },

    iconHover: {
      color: "#0e5cbd",
    },

    // MOBILE
    mobileStyles: {
      footerSection: {
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      },

      poweredBy: {
        alignItems: "center",
        marginBottom: "1.5rem",
      },

      footerBottom: {
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      },

      footerLinks: {
        justifyContent: "center",
      },
    },
  };

  // Mobile check
  const isMobile = window.innerWidth <= 768;

  const getStyle = (base, mobile) => (isMobile ? { ...base, ...mobile } : base);

  return (
    <footer style={styles.footerContainer}>
      <div style={styles.footerContent}>
        <div style={getStyle(styles.footerSection, styles.mobileStyles.footerSection)}>
          
          {/* LEFT SECTION */}
          <div style={getStyle(styles.poweredBy, styles.mobileStyles.poweredBy)}>
            <span style={styles.poweredText}>Powered by</span>
            <span style={styles.companyName}>Kagafatech</span>

            {/* Social Media */}
            <div style={styles.iconRow}>
              <FaFacebook
                style={styles.icon}
                onMouseEnter={(e) => (e.target.style.color = styles.iconHover.color)}
                onMouseLeave={(e) => (e.target.style.color = styles.icon.color)}
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div style={getStyle(styles.addressSection, styles.mobileStyles.addressSection)}>
            <h3 style={styles.addressTitle}>Penden Office</h3>
            <p style={styles.addressText}>
              123 Innovation Drive<br />
              Penden Tech Park<br />
              Penden, PN 56789<br />
              Bhutan
            </p>
          </div>
        </div>

        {/* BOTTOM */}
        <div style={getStyle(styles.footerBottom, styles.mobileStyles.footerBottom)}>
          <p style={styles.copyright}>
            © {new Date().getFullYear()} Kagafatech. All rights reserved.
          </p>

          <div style={getStyle(styles.footerLinks, styles.mobileStyles.footerLinks)}>
            <a href="/privacy" style={styles.footerLink}>Privacy Policy</a>
            <a href="/terms" style={styles.footerLink}>Terms of Service</a>
            <a href="/contact" style={styles.footerLink}>Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
