import { h } from 'preact';
import { memo } from 'preact/compat';

const SvgVerticalMoreOption = (props: any) => (
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
      d="M17.035 311.064a2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2zm-.045-14.003a2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2zm-.025 7.002a2 2 0 0 0-2-2 2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 0 2-2z"
      transform="translate(0 -289.063)"
    />
  </svg>
);

const Memo = memo(SvgVerticalMoreOption);
export default Memo;
