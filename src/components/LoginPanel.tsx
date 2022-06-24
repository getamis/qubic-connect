import { ComponentChildren } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import { CSSProperties, memo } from 'preact/compat';
import jss from 'jss';
import clsx from 'clsx';
import { commonClasses } from './styles';

export interface LoginPanelProps {
  children: ComponentChildren;
  titleText?: string;
  containerStyle?: CSSProperties;
  backdropStyle?: CSSProperties;
}

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
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
    },
    modalHidden: {
      display: 'none',
    },
    backdrop: {
      zIndex: -1,
      position: 'fixed',
      width: '100vw',
      height: '100vh',
    },
  })
  .attach();

export const LoginFullScreen = memo<LoginPanelProps>(props => {
  const { children, titleText = 'Login', containerStyle, backdropStyle } = props;
  const [isVisible, setIsVisible] = useState(false);

  const handleVisibilitySwitch = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  console.log({
    commonClasses,
    answer: clsx(commonClasses.button, commonClasses.buttonWhite),
  });

  return (
    <>
      <div
        className={clsx(classes.modal, {
          [classes.modalHidden]: !isVisible,
        })}
      >
        <div className={classes.backdrop} style={backdropStyle} onClick={handleVisibilitySwitch} />
        <div>{children}</div>
      </div>
      <div style={containerStyle}>
        <button
          type="button"
          onClick={handleVisibilitySwitch}
          className={clsx(commonClasses.button, commonClasses.buttonWhite)}
        >
          <span className={commonClasses.text}>{titleText} </span>
        </button>
      </div>
    </>
  );
});
