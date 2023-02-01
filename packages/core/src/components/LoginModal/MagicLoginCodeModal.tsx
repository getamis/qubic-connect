import jss from 'jss';
import { memo } from 'preact/compat';
import clsx from 'clsx';

import { LEAVE_IAB_MODAL_ID } from '../../constants/domId';
import { commonClasses } from '../styles';

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
      flexDirection: 'column',
      zIndex: 100,
      touchAction: 'none',
    },
    panel: {
      backgroundColor: 'white',
      color: 'black',
      padding: 24,
      borderRadius: 16,
      position: 'relative',
    },
    backdrop: {
      zIndex: -1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      position: 'fixed',
      width: '100vw',
      height: '100vh',
    },
    hint: {
      marginBottom: 12,
    },
    passCode: {
      fontSize: 32,
    },
    close: {
      position: 'absolute',
      top: 12,
      right: 12,
    },
  })
  .attach();

interface MagicLoginCodeModalProps {
  passCode: string;
  onLogin: () => void;
  visible: boolean;
  onClose: () => void;
}

const MagicLoginCodeModal = memo<MagicLoginCodeModalProps>(props => {
  const { passCode, onLogin, visible, onClose } = props;

  return (
    <div
      id={LEAVE_IAB_MODAL_ID}
      className={clsx(classes.modal)}
      style={{
        display: visible ? 'flex' : 'none',
      }}
    >
      <div className={classes.backdrop} />
      <div className={classes.panel}>
        <div className={classes.close} onClick={onClose}>
          X
        </div>
        <div className={classes.hint}>
          <h4>登入者身分認證</h4>
          <p>請在 Qubic Wallet 錢包顯示認證碼，然後點選認證</p>
          <p>若不登入請關閉此畫面</p>
        </div>
        <div className={classes.passCode}>
          <h3>{passCode}</h3>
        </div>
        <div>
          <button type="button" className={clsx(commonClasses.button)} onClick={onLogin}>
            認證
          </button>
        </div>
      </div>
    </div>
  );
});
export default MagicLoginCodeModal;
