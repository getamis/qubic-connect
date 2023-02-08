import { h } from 'preact';
import { memo } from 'preact/compat';

const SvgTooltipArrow = (props: any) => (
  <svg width={48} height={12} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M24 0c2.817 0 2.984 12 12 12H12c9.016 0 9.183-12 12-12Z" fill="#2962FF" />
  </svg>
);

const Memo = memo(SvgTooltipArrow);
export default Memo;
