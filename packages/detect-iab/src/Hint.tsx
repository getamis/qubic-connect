import { memo, PropsWithChildren } from 'preact/compat';
import clsx from 'clsx';
import { classes } from './styles';
import TooltipArrow from './icons/TooltipArrow';

type Props = PropsWithChildren<{
  arrowPosition: 'top' | 'bottom' | null;
}>;

const Hint = memo<Props>(props => {
  const { children, arrowPosition } = props;

  const hintWrapperClass = (() => {
    switch (arrowPosition) {
      case 'top':
        return clsx(classes.hintWrapper, classes.hintWrapperTop);
      case 'bottom':
      default:
        return clsx(classes.hintWrapper, classes.hintWrapperBottom);
    }
  })();

  return (
    <div className={hintWrapperClass}>
      <div className={classes.dialogWrapper}>
        <p className={classes.dialogText}>{children}</p>
        <div className={arrowPosition === 'top' ? classes.arrowTopWrapper : classes.arrowBottomWrapper}>
          <TooltipArrow />
        </div>
      </div>
    </div>
  );
});

export default Hint;
