import React from 'react';

const Footer = () => {
  const styles = {
    footerContainer: {
      background: 'linear-gradient(135deg, #3a3a3a 0%, #2d2d2d 100%)',
      color: '#e0e0e0',
      padding: '2rem 1rem 1.5rem',
      fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      borderTop: '1px solid #404040',
      boxShadow: '0 -5px 15px rgba(0, 0, 0, 0.1)',
      width: '100%',
      boxSizing: 'border-box',
    },
    
    footerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 0.5rem',
    },
    
    footerSection: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingBottom: '1.5rem',
      borderBottom: '1px solid #444',
      marginBottom: '1.5rem',
      flexDirection: 'row',
    },
    
    poweredBy: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      marginBottom: '1.5rem',
      minWidth: '200px',
    },
    
    poweredText: {
      fontSize: '0.85rem',
      color: '#b0b0b0',
      letterSpacing: '0.5px',
      marginBottom: '0.3rem',
    },
    
    companyName: {
      fontSize: '2rem',
      fontWeight: '700',
      background: 'linear-gradient(90deg, #a0a0a0, #d4d4d4)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
      letterSpacing: '1px',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
      lineHeight: '1.2',
    },
    
    addressSection: {
      maxWidth: '280px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '1rem 1.2rem',
      borderRadius: '8px',
      borderLeft: '3px solid #808080',
      marginTop: '0',
    },
    
    addressTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '0.8rem',
      color: '#d8d8d8',
      letterSpacing: '0.5px',
    },
    
    addressText: {
      lineHeight: '1.6',
      color: '#b8b8b8',
      fontSize: '0.9rem',
      margin: '0',
    },
    
    footerBottom: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.5rem',
    },
    
    copyright: {
      color: '#aaa',
      fontSize: '0.85rem',
      margin: '0.5rem 0',
      flex: '1',
      minWidth: '250px',
    },
    
    footerLinks: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    },
    
    footerLink: {
      color: '#c0c0c0',
      textDecoration: 'none',
      fontSize: '0.85rem',
      transition: 'all 0.3s ease',
      position: 'relative',
      paddingBottom: '2px',
      whiteSpace: 'nowrap',
    },
    
    footerLinkHover: {
      color: '#ffffff',
    },
    
    // Mobile-specific styles
    mobileStyles: {
      footerContainer: {
        padding: '1.5rem 0.8rem 1rem',
      },
      
      footerSection: {
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      },
      
      poweredBy: {
        alignItems: 'center',
        marginBottom: '1.5rem',
      },
      
      companyName: {
        fontSize: '1.8rem',
      },
      
      addressSection: {
        maxWidth: '100%',
        width: '100%',
        boxSizing: 'border-box',
        marginTop: '0.5rem',
      },
      
      footerBottom: {
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        textAlign: 'center',
      },
      
      footerLinks: {
        justifyContent: 'center',
        gap: '1rem',
      },
      
      copyright: {
        textAlign: 'center',
        minWidth: 'auto',
      },
    }
  };

  // Check for mobile screen size
  const isMobile = window.innerWidth <= 768;
  
  // Merge styles based on screen size
  const getStyle = (baseStyle, mobileStyle) => {
    return isMobile ? { ...baseStyle, ...mobileStyle } : baseStyle;
  };

  return (
    <footer style={getStyle(styles.footerContainer, styles.mobileStyles.footerContainer)}>
      <div style={styles.footerContent}>
        <div style={getStyle(styles.footerSection, styles.mobileStyles.footerSection)}>
          <div style={getStyle(styles.poweredBy, styles.mobileStyles.poweredBy)}>
            <span style={styles.poweredText}>Powered by</span>
            <span style={getStyle(styles.companyName, styles.mobileStyles.companyName)}>Kagafatech</span>
          </div>
          
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
        
        <div style={getStyle(styles.footerBottom, styles.mobileStyles.footerBottom)}>
          <p style={getStyle(styles.copyright, styles.mobileStyles.copyright)}>
            &copy; {new Date().getFullYear()} Kagafatech. All rights reserved.
          </p>
          <div style={getStyle(styles.footerLinks, styles.mobileStyles.footerLinks)}>
            <a 
              href="/privacy" 
              style={styles.footerLink}
              onMouseEnter={(e) => e.target.style.color = styles.footerLinkHover.color}
              onMouseLeave={(e) => e.target.style.color = styles.footerLink.color}
            >
              Privacy Policy
            </a>
            <a 
              href="/terms" 
              style={styles.footerLink}
              onMouseEnter={(e) => e.target.style.color = styles.footerLinkHover.color}
              onMouseLeave={(e) => e.target.style.color = styles.footerLink.color}
            >
              Terms of Service
            </a>
            <a 
              href="/contact" 
              style={styles.footerLink}
              onMouseEnter={(e) => e.target.style.color = styles.footerLinkHover.color}
              onMouseLeave={(e) => e.target.style.color = styles.footerLink.color}
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;