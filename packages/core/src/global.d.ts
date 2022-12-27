declare module '@qubic-js/detect-inapp' {
  export type InAppBrowser =
    | 'messenger'
    | 'facebook'
    | 'twitter'
    | 'line'
    | 'wechat'
    | 'puffin'
    | 'miui'
    | 'instagram'
    | 'chrome'
    | 'safari'
    | 'ie'
    | 'firefox';

  class InApp {
    constructor(userAgent: string);
    ua: string;
    browser: InAppBrowser;
    isDesktop: boolean;
    isInApp: boolean;
    isMobile: boolean;
  }

  export default InApp;
}
