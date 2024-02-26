const en = {
  alertIabSentence1: 'You are using an in-app browser.',
  alertIabSentence2:
    'Some functions will be affected. To have a better experience, tap “⋯” and choose “open in system browser”.',
  hintPart1: 'Tap "',
  hintPart2: '" and choose "',
  hintPart3: '".',
  openInBrowser: 'Open in browser',
  openInSystemBrowser: 'Open in system browser',
  openInDefaultBrowser: 'Open in your default browser',
  openInSafari: 'Open in Safari',
  openInSafariInNormal: 'Open in Safari in normal mode',
  openInChrome: 'Open in Chrome',
  copy: 'Copy',
  copied: 'Copied',
};

const zhTW = {
  alertIabSentence1: '您正在使用其他應用程式的瀏覽器',
  alertIabSentence2: '可能會影響部分功能，為了享有更完整的服務，請點擊「⋯」，並選擇「 以瀏覽器開啟」。',
  hintPart1: '點擊「',
  hintPart2: '」，並選擇「',
  hintPart3: '」',
  openInBrowser: '在瀏覽器中開啟',
  openInSystemBrowser: '以瀏覽器開啟',
  openInDefaultBrowser: '使用預設瀏覽器開啟',
  openInSafari: '在 Safari 開啟',
  openInSafariInNormal: '在 Safari 以一般模式開啟',
  openInChrome: '在 Chrome 開啟',
  copy: '複製',
  copied: '已複製',
};

export function getLocaleStrings(): Record<string, string> {
  // for next.js server side rendering
  if (typeof window === 'undefined') return en;
  // Client-side-only code
  const navigatorLanguage = window.navigator.language || navigator.language;

  if (navigatorLanguage && navigatorLanguage.toLowerCase().startsWith('zh')) {
    return zhTW;
  }

  return en;
}
