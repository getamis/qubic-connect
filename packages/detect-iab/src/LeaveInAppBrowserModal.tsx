import { useEffect, memo, useCallback, useState } from 'preact/compat';
import clsx from 'clsx';
import InApp, { InAppBrowser } from '@qubic-js/detect-inapp';

import HorizontalMoreOptions from './icons/HorizontalMoreOptions';
import VerticalMoreOptions from './icons/VerticalMoreOptions';
import { LEAVE_IAB_MODAL_ID } from './constant';
import { getLocaleStrings } from './locale';
import { classes } from './styles';
import Hint from './Hint';
import { doubleBrowserIcons } from './icons/DoubleBrowserIcons';

const localeStrings = getLocaleStrings();

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
      case 'instagram':
        return <HorizontalMoreOptions className={classes.icon} />;
      default:
    }
  }

  if (platform === 'android') {
    switch (browser) {
      case 'instagram':
        return <VerticalMoreOptions className={classes.icon} />;
      default:
    }
  }

  return <HorizontalMoreOptions className={classes.icon} />;
}

function getHintBrowserString(platform: Platform, browser: InAppBrowser) {
  if (platform === 'ios') {
    switch (browser) {
      case 'instagram':
        return localeStrings.openInSystemBrowser; // open in system browser
      default:
    }
  }

  if (platform === 'android') {
    switch (browser) {
      case 'instagram':
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
      case 'instagram':
        return 'top';
      default:
    }
  }

  if (platform === 'android') {
    switch (browser) {
      case 'instagram':
        return 'top';
      default:
    }
  }

  return null;
}

const LeaveInAppBrowserModal = memo<ModalProps>(props => {
  const { inApp, options } = props;

  const { redirectUrl: optionsRedirectUrl, shouldAlwaysShowCopyUI = false } = options || {};
  const redirectUrl = optionsRedirectUrl || window.location.href;

  const platform = getPlatform(inApp.ua);
  const currentBrowser =
    platform === 'android' && inApp.browser === 'facebook' ? getAndroidFacebookBrowser(inApp.ua) : inApp.browser;

  const arrowPosition = getArrowPosition(platform, currentBrowser);

  useEffect(() => {
    const body = document.querySelector('body');
    if (body) {
      body.style.overflow = 'hidden';
    }
  }, []);

  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const copyFn = useCallback(
    (manual: boolean) => async () => {
      const text = redirectUrl;

      if (typeof navigator !== undefined && typeof navigator.clipboard !== undefined) {
        const resolve = () => {
          if (manual) {
            setCopied(true);
          }
        };
        const reject = (err: any) => {
          console.error(`透過 Clipboard 複製至剪貼簿失敗:${err.toString()}`);
          setCopyFailed(true);
        };

        navigator.clipboard.writeText(text).then(resolve, reject);
      } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
        try {
          const textarea = document.createElement('textarea');
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
    },
    [redirectUrl],
  );

  const displayMode = shouldAlwaysShowCopyUI || !arrowPosition ? DisplayMode.COPY : DisplayMode.HINT;

  return (
    <div id={LEAVE_IAB_MODAL_ID} className={classes.modal}>
      <div className={classes.backdrop}>
        <div className={classes.contentWrapper}>
          <img src={`data:image/png;base64, ${doubleBrowserIcons}`} alt="browser" style={{ width: 120, height: 120 }} />
          <span className={classes.alertSentence1}>{localeStrings.alertIabSentence1}</span>
          <span className={classes.alertSentence2}>{localeStrings.alertIabSentence2}</span>
          {displayMode === DisplayMode.COPY && (
            <div className={classes.currentUrlWrapper}>
              <input readOnly value={redirectUrl} className={classes.currentUrlInput} />
              {!copyFailed && (
                <button
                  type="button"
                  className={clsx([classes.currentUrlBtn, copied ? classes.currentUrlBtnCopied : undefined])}
                  onClick={copyFn(true)}
                >
                  {copied ? localeStrings.copied : localeStrings.copy}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {displayMode === DisplayMode.HINT && (
        <Hint arrowPosition={arrowPosition}>
          {localeStrings.hintPart1}
          {getHintImage(platform, currentBrowser)}
          {localeStrings.hintPart2}
          {getHintBrowserString(platform, currentBrowser)}
          {localeStrings.hintPart3}
        </Hint>
      )}
    </div>
  );
});
export default LeaveInAppBrowserModal;
