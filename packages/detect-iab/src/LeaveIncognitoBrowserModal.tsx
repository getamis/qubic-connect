import { memo, useMemo } from 'preact/compat';

import { LEAVE_INCOGNITO_MODAL_ID } from './constant';
import { getLocaleStrings } from './locale';
import { classes } from './styles';
import Hint from './Hint';
import { doubleBrowserIcons } from './icons/DoubleBrowserIcons';

const localeStrings = getLocaleStrings();

interface ModalProps {
  browserName: string;
}

const isiPhone = typeof window !== 'undefined' ? /iPhone|iPod/i.test(navigator.userAgent) : false;

const LeaveIncognitoBrowserModal = memo<ModalProps>(props => {
  const { browserName } = props;

  const arrowPosition = useMemo(() => {
    // in iOS, Built in QR Code app will open web in private browsing mode
    //               iPhone                     |     iPad
    // QRCode App | Open in Safari on Bottom    |  Open in Safari on Top
    // Safari     | Open Tabs on Bottom         |  Open Tabs on Top
    if (browserName !== 'Safari') return null;
    if (isiPhone) {
      return 'bottom';
    }
    return 'top';
  }, [browserName]);

  return (
    <div id={LEAVE_INCOGNITO_MODAL_ID} className={classes.modal}>
      <div className={classes.backdrop}>
        <div className={classes.contentWrapper}>
          <img src={`data:image/png;base64, ${doubleBrowserIcons}`} alt="browser" style={{ width: 120, height: 120 }} />
          <span className={classes.alertSentence1}>{localeStrings.alertIncognitoSentence1}</span>
          <span className={classes.alertSentence2}>{localeStrings.alertIncognitoSentence2}</span>
        </div>
        {browserName === 'Safari' && <Hint arrowPosition={arrowPosition}>{localeStrings.openInSafariInNormal}</Hint>}
      </div>
    </div>
  );
});
export default LeaveIncognitoBrowserModal;
