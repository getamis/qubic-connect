import React, { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-web';
import { useTranslation } from 'react-i18next';

import { getCommonClasses } from './styles';

type ErrorContent = {
  reason?: string;
  detail?: string | JSX.Element;
};

const DEFAULT_TEXT = 'Something went wrong...';

const ErrorContent = ({ reason, detail }: ErrorContent): JSX.Element => {
  const [loadedAnim, setLoadAnim] = useState(false);
  const lottieContainerRef = useRef(null);

  const commonClasses = getCommonClasses();

  const { t } = useTranslation();

  useEffect(() => {
    if (lottieContainerRef.current && !loadedAnim) {
      Lottie.loadAnimation({
        // @ts-ignore
        container: lottieContainerRef.current, // the dom element that will contain the animation
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://storage.qubic.market/partners/Foundation/buy-error.json',
      });

      setLoadAnim(true);
    }
  }, [loadedAnim]);

  return (
    <div className={commonClasses.infoMsgMain}>
      <div id="lottie-container" className={commonClasses.lottieErrorContainer} ref={lottieContainerRef} />
      <div className={commonClasses.hint}>
        <div className={commonClasses.row}>
          <p className={commonClasses.errorStrong}>{reason || DEFAULT_TEXT}</p>
          {detail ? <p>{detail}</p> : <p>{t('contact_us')}</p>}
        </div>
      </div>
    </div>
  );
};

export default ErrorContent;
