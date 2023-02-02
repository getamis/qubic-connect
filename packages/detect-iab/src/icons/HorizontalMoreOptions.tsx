import { h } from 'preact';
import { memo } from 'preact/compat';

const SvgHorizontalMoreOption = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 30 30" {...props}>
    <path
      style={{
        fill: '#fff',
        fillOpacity: 1,
        stroke: 'none',
        strokeWidth: 0.5,
        strokeMiterlimit: 4,
        strokeDasharray: 'none',
        strokeOpacity: 1,
      }}
      d="M22.002 12.965a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2zm-14.004.045a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2zm7.002.025a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2 2 2 0 0 0-2-2z"
    />
  </svg>
);

const Memo = memo(SvgHorizontalMoreOption);
export default Memo;
