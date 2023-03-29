import jss from 'jss';
import preset from 'jss-preset-default';
import { useEffect, memo, useMemo, useCallback, useState } from 'preact/compat';
import clsx from 'clsx';
import InApp, { InAppBrowser } from '@qubic-js/detect-inapp';

import HorizontalMoreOptions from './icons/HorizontalMoreOptions';
import VerticalMoreOptions from './icons/VerticalMoreOptions';
import ExportMoreOptions from './icons/ExportMoreOptions';
import TooltipArrow from './icons/TooltipArrow';
import { LEAVE_IAB_MODAL_ID, doubleBrowserIcons } from './constant';
import { getLocaleStrings } from './locale';

// One time setup with default plugins and settings.
jss.setup(preset());

const localeStrings = getLocaleStrings();

const { classes } = jss
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
      zIndex: 100,
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
      position: 'absolute',
      top: 20,
    },
    hintWrapperBottom: {
      position: 'absolute',
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
    }
  })
  .attach();


export interface ShowBlockerOptions {
  redirectUrl?: string;
  shouldAlwaysShowCopyUI?: boolean;
}

enum DisplayMode {
  HINT = 'hint',
  COPY = 'copy',
}

interface ModalProps {
  inApp: InApp;
  options?: ShowBlockerOptions;
}

function getHintImage(platform: Platform, browser: InAppBrowser) {
  if (platform === 'ios') {
    switch (browser) {
      case 'facebook':
        return (
          <HorizontalMoreOptions className={classes.icon} />
        );
      case 'instagram':
        return (
          <HorizontalMoreOptions className={classes.icon} />
        );
      case 'line':
        return (
          <VerticalMoreOptions className={classes.icon} />
        );
      case 'messenger':
        return (
          <ExportMoreOptions className={classes.exportMoreIcon} />
        );
      default:
    }
  }

  if (platform === 'android') {
    switch (browser) {
      case 'facebook':
        return (
          <HorizontalMoreOptions className={classes.icon} />
        );
      case 'instagram':
        return (
          <VerticalMoreOptions className={classes.icon} />
        );
      case 'line':
        return (
          <VerticalMoreOptions className={classes.icon} />
        );
      case 'messenger':
        return (
          <VerticalMoreOptions className={classes.icon} />
        );
      default:
    }
  }

  return (
    <HorizontalMoreOptions className={classes.icon} />
  );
}

function getHintBrowserString(platform: Platform, browser: InAppBrowser) {
  if (platform === 'ios') {
    switch (browser) {
      case 'facebook':
        return localeStrings.openInSystemBrowser; // open in system browser
      case 'instagram':
        return localeStrings.openInSystemBrowser; // open in system browser
      case 'line':
        return localeStrings.openInBrowser; // open in browser
      case 'messenger':
        return localeStrings.openInSafari; // open in safari
      default:
    }
  }

  if (platform === 'android') {
    switch (browser) {
      case 'facebook':
        return localeStrings.openInSystemBrowser; // open in system browser
      case 'instagram':
        return localeStrings.openInChrome; // Open in Chrome
      case 'line':
        return localeStrings.openInDefaultBrowser; // open in your default browser
      case 'messenger':
        return localeStrings.openInChrome; // Open in Chrome
      default:
    }
  }
  return localeStrings.openInSystemBrowser; // open in system browser
}

type Platform = 'windows' | 'android' | 'ios' | 'unknown';

function getPlatform(userAgent: string): Platform {
  // Windows Phone must come first because its UA also contains "Android"
  if (/windows phone/i.test(userAgent)) {
    return 'windows';
  }

  if (/android/i.test(userAgent)) {
    return 'android';
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
    return 'ios';
  }

  return 'unknown';
}

function getAndroidFacebookBrowser(userAgent: string): InAppBrowser {
  if (/Orca-Android/i.test(userAgent)) {
    return 'messenger';
  }

  return 'facebook';
}

function getArrowPosition(platform: Platform, browser: InAppBrowser) {
  if (platform === 'ios') {
    switch (browser) {
      case 'facebook':
        return 'bottom';
      case 'instagram':
        return 'top';
      case 'line':
        return 'bottom';
      case 'messenger':
        return 'bottom';
      default:
    }
  }

  if (platform === 'android') {
    switch (browser) {
      case 'facebook':
        return 'top';
      case 'instagram':
        return 'top';
      case 'line':
        return 'bottom';
      case 'messenger':
        return 'top';
      default:
    }
  }

  return null;
}

function isBlurSupported(): boolean {
  // https://developer.mozilla.org/en-US/docs/Web/API/CSS/supports
  // https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter#Browser_compatibility
  return (
    typeof CSS !== 'undefined' &&
    (CSS.supports('-webkit-backdrop-filter', 'blur(1px)') ||
      CSS.supports('backdrop-filter', 'blur(1px)'))
  );
}

const LeaveInAppBrowserModal = memo<ModalProps>(props => {
  const { inApp, options } = props;

  const { redirectUrl: optionsRedirectUrl, shouldAlwaysShowCopyUI = false } = options || {};
  const redirectUrl = optionsRedirectUrl || window.location.href;

  const platform = getPlatform(inApp.ua);
  const currentBrowser =
    platform === 'android' && inApp.browser === 'facebook' ? getAndroidFacebookBrowser(inApp.ua) : inApp.browser;

  const arrowPosition = getArrowPosition(platform, currentBrowser);

  const hintWrapperClass = (() => {
    switch (arrowPosition) {
      case 'top':
        return clsx(classes.hintWrapper, classes.hintWrapperTop);
      case 'bottom':
      default:
        return clsx(classes.hintWrapper, classes.hintWrapperBottom);
    }
  })();

  useEffect(() => {
    const body = document.querySelector("body");
    if (body) {
      body.style.overflow = "hidden";
    }
  }, []);

  const blurStyle = useMemo(() => {
    if (isBlurSupported()) {
      return {
        backdropFilter: 'saturate(180%) blur(10px)',
        WebKitBackdropFilter: 'saturate(180%) blur(10px)',
      }
    }

    return {};
  }, []);

  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const copyFn = useCallback((manual: boolean) => async () => {
    const text = redirectUrl;

    if (typeof navigator !== undefined && typeof navigator.clipboard !== undefined) {
      const resolve = () => { 
        if (manual) {
          setCopied(true);
        }
      }
      const reject = (err: any) => { 
        console.error('透過 Clipboard 複製至剪貼簿失敗:' + err.toString() ); 
        setCopyFailed(true);
      }

      navigator.clipboard.writeText(text).then(resolve, reject)
    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.display = 'none';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        if (manual) {
          setCopied(true);
        }
      } catch (e) {
        setCopyFailed(true);
      }
    }
  }, [redirectUrl]);

  const displayMode = shouldAlwaysShowCopyUI || !arrowPosition ? DisplayMode.COPY : DisplayMode.HINT;

  return (
    <div id={LEAVE_IAB_MODAL_ID} className={classes.modal}>
      <div className={classes.backdrop} style={blurStyle}>
        <div className={classes.contentWrapper}>
          <img src={`data:image/png;base64, ${doubleBrowserIcons}`} alt="browser" style={{ width: 120, height: 120 }} />
          <span className={classes.alertSentence1}>
            {localeStrings.alertSentence1}
          </span>
          <span className={classes.alertSentence2}>
            {localeStrings.alertSentence2}
          </span>
          {displayMode === DisplayMode.COPY && (
            <div className={classes.currentUrlWrapper}>
              <input
                readOnly
                value={redirectUrl}
                className={classes.currentUrlInput}
              />
              {!copyFailed && (
                <button type="button" className={clsx([classes.currentUrlBtn, copied ? classes.currentUrlBtnCopied : undefined])} onClick={copyFn(true)}>
                  {copied ? localeStrings.copied : localeStrings.copy}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {displayMode === DisplayMode.HINT && (
        <div className={hintWrapperClass}>
          <div className={classes.dialogWrapper}>
            <p className={classes.dialogText}>
              {localeStrings.hintPart1}
              {getHintImage(platform, currentBrowser)}
              {localeStrings.hintPart2}
              {getHintBrowserString(platform, currentBrowser)}
              {localeStrings.hintPart3}
            </p>
            <div className={arrowPosition === 'top' ? classes.arrowTopWrapper : classes.arrowBottomWrapper}>
              <TooltipArrow />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
export default LeaveInAppBrowserModal;
