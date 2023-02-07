import InApp from '@qubic-js/detect-inapp';
import { render } from 'preact';
import { LEAVE_IAB_MODAL_ID } from './constant';
import LeaveInAppBrowserModal from './LeaveInAppBrowserModal';

export function showBlockerWhenIab(): void {
  const inapp = new InApp(navigator.userAgent || navigator.vendor || (window as any).opera);

  if (inapp.isInApp && !document.getElementById(LEAVE_IAB_MODAL_ID)) {
    const createdRootDiv = document.createElement('div');
    document.body.appendChild(createdRootDiv);

    render(<LeaveInAppBrowserModal inApp={inapp} />, createdRootDiv);
  }
}