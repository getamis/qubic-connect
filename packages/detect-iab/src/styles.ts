import jss from 'jss';
import preset from 'jss-preset-default';

// One time setup with default plugins and settings.
jss.setup(preset());

export const { classes } = jss
  .createStyleSheet({
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      zIndex: 2147483647, // max number make sure in the most front
      touchAction: 'none',
    },
    backdrop: {
      zIndex: -1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      position: 'fixed',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backdropFilter: 'saturate(180%) blur(10px)',
      WebkitBackdropFilter: 'saturate(180%) blur(10px)',
    },
    contentWrapper: {
      padding: '0 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    emoji: {
      fontSize: 60,
      lineHeight: '60px',
    },
    alertSentence1: {
      fontSize: 16,
      lineHeight: '24px',
      color: '#FFF',
      fontWeight: 600,
      textAlign: 'center',
      marginTop: 16,
    },
    alertSentence2: {
      fontSize: 14,
      lineHeight: '18px',
      color: '#FFF',
      fontWeight: 400,
      textAlign: 'center',
      marginTop: 8,
    },
    hintWrapper: {
      maxWidth: 'calc(100% - 16px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      right: 8,
    },
    hintWrapperTop: {
      position: 'fixed',
      top: 20,
    },
    hintWrapperBottom: {
      position: 'fixed',
      bottom: 20,
    },
    dialogWrapper: {
      borderRadius: 8,
      padding: '8px 16px',
      backgroundColor: '#2962FF',
      position: 'relative',
    },
    dialogText: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: 16,
      lineHeight: '24px',
      color: '#FFF',
      fontWeight: 400,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      margin: 0,
      flexWrap: 'wrap',
    },
    icon: {
      width: 24,
      height: 24,
    },
    exportMoreIcon: {
      width: 16,
      height: 16,
      paddingLeft: 8,
      paddingRight: 8,
    },
    arrowTopWrapper: {
      display: 'flex',
      position: 'absolute',
      bottom: 'calc(100% - 1px)',
      right: 12,
    },
    arrowBottomWrapper: {
      display: 'flex',
      position: 'absolute',
      top: 'calc(100% - 1px)',
      right: 12,
      transform: 'rotate(180deg) scaleX(-1)',
    },
    currentUrlWrapper: {
      display: 'flex',
      flexDirection: 'row',
      borderRadius: 8,
      width: 'calc(100% - 48px)',
      backgroundColor: 'white',
      padding: 4,
      marginTop: 24,
    },
    currentUrlInput: {
      height: 40,
      flex: 1,
      minWidth: 0,
      border: 'none',
      userSelect: 'all',
      borderRadius: 8,
      fontSize: 16,
      lineHeight: '24px',
      '&:focus': {
        outline: 'none',
      },
    },
    currentUrlBtn: {
      flexShrink: 0,
      border: 0,
      color: '#2962FF',
      fontSize: 16,
      lineHeight: '24px',
      backgroundColor: 'transparent',
      padding: '8px 16px',
    },
    currentUrlBtnCopied: {
      color: '#5FC417',
    },
  })
  .attach();

export {};
