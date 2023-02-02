import jss from 'jss';
import { memo } from 'preact/compat';
import clsx from 'clsx';
import InApp, { InAppBrowser } from '@qubic-js/detect-inapp';

import HorizontalMoreOptions from './icons/HorizontalMoreOptions';
import VerticalMoreOptions from './icons/VerticalMoreOptions';
import ExportMoreOptions from './icons/ExportMoreOptions';
import ArrowForward from './icons/ArrowForward';
import { LEAVE_IAB_MODAL_ID } from './constant';

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
    },
    hintWrapper: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    hintWrapperTopRight: {
      position: 'absolute',
      top: 70,
      right: 70,
    },
    hintWrapperBottomRight: {
      position: 'absolute',
      bottom: 70,
      right: 70,
    },
    notLastRow: {
      marginBottom: 20,
    },
    textWhite: {
      fontFamily: 'Roboto, sans-serif',
      fontSize: '20px',
      color: 'white',
      fontWeight: 600,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    icon: {
      width: 24,
      height: 24,
    },
    iconWithMargin: {
      marginLeft: 8,
      width: 24,
      height: 24,
    },
    arrowWrapper: {
      alignSelf: 'flex-end',
      transform: 'rotate(90deg) scaleX(-1)',
    },
    upsideDown: {
      transform: 'rotate(-90deg) scaleX(-1) scaleY(-1)',
    },
  })
  .attach();

interface ModalProps {
  inApp: InApp;
}

function getFirstLine(platform: Platform, browser: InAppBrowser) {
  if (platform === 'ios') {
    switch (browser) {
      case 'facebook':
        return (
          <>
            1. 點擊右下角的
            <HorizontalMoreOptions className={classes.icon} />
          </>
        );
      case 'instagram':
        return (
          <>
            1. 點擊右上角的
            <HorizontalMoreOptions className={classes.icon} />
          </>
        );
      case 'line':
        return (
          <>
            1. 點擊右下角的
            <VerticalMoreOptions className={classes.icon} />
          </>
        );
      case 'messenger':
        return (
          <>
            1. 點擊右下角的
            <ExportMoreOptions className={classes.iconWithMargin} />
          </>
        );
      default:
    }
  }

  if (platform === 'android') {
    switch (browser) {
      case 'facebook':
        return (
          <>
            1. 點擊右上角的
            <HorizontalMoreOptions className={classes.icon} />
          </>
        );
      case 'instagram':
        return (
          <>
            1. 點擊右上角的
            <VerticalMoreOptions className={classes.icon} />
          </>
        );
      case 'line':
        return (
          <>
            1. 點擊右下角的
            <VerticalMoreOptions className={classes.icon} />
          </>
        );
      case 'messenger':
        return (
          <>
            1. 點擊右上角的
            <VerticalMoreOptions className={classes.iconWithMargin} />
          </>
        );
      default:
    }
  }

  return (
    <>
      1. 點擊
      <HorizontalMoreOptions className={classes.icon} />
      或
      <VerticalMoreOptions className={classes.icon} />
      或
      <ExportMoreOptions className={classes.iconWithMargin} />
    </>
  );
}

function getSecondLine(platform: Platform, browser: InAppBrowser) {
  if (platform === 'ios') {
    switch (browser) {
      case 'facebook':
        return '2. 選擇 「以瀏覽器開啟」';
      case 'instagram':
        return '2. 選擇 「以瀏覽器開啟」';
      case 'line':
        return '2. 選擇 「在瀏覽器中開啟」';
      case 'messenger':
        return '2. 選擇 「在 Safari 開啟」';
      default:
    }
  }

  if (platform === 'android') {
    switch (browser) {
      case 'facebook':
        return '2. 選擇 「以瀏覽器開啟」';
      case 'instagram':
        return '2. 選擇 「在 Chrome 開啟」';
      case 'line':
        return '2. 選擇 「使用預設瀏覽器開啟」';
      case 'messenger':
        return '2. 選擇 「在 Chrome 開啟」';
      default:
    }
  }
  return '2. 選擇 「以瀏覽器開啟」';
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

const LeaveInAppBrowserModal = memo<ModalProps>(props => {
  const { inApp } = props;

  const platform = getPlatform(inApp.ua);
  const currentBrowser =
    platform === 'android' && inApp.browser === 'facebook' ? getAndroidFacebookBrowser(inApp.ua) : inApp.browser;

  const arrowPosition = getArrowPosition(platform, currentBrowser);

  const hintWrapperClass = (() => {
    switch (arrowPosition) {
      case 'top':
        return clsx(classes.hintWrapper, classes.hintWrapperTopRight);
      case 'bottom':
        return clsx(classes.hintWrapper, classes.hintWrapperBottomRight);
      default:
        return clsx(classes.hintWrapper);
    }
  })();

  return (
    <div id={LEAVE_IAB_MODAL_ID} className={clsx(classes.modal)}>
      <div className={classes.backdrop} />
      <div className={hintWrapperClass}>
        {arrowPosition === 'top' && (
          <div className={clsx(classes.arrowWrapper)}>
            <ArrowForward />
          </div>
        )}
        <p className={clsx(classes.textWhite, classes.notLastRow)}>{getFirstLine(platform, currentBrowser)}</p>
        <p className={clsx(classes.textWhite)}>{getSecondLine(platform, currentBrowser)}</p>
        {arrowPosition === 'bottom' && (
          <div className={clsx(classes.arrowWrapper, classes.upsideDown)}>
            <ArrowForward />
          </div>
        )}
      </div>
    </div>
  );
});
export default LeaveInAppBrowserModal;
