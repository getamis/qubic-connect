const en = {
  alertSentence1: "You are using a third-party browser",
  alertSentence2: "To have a better experience, open the website in system browser.",
  hintPart1: "Tap \"",
  hintPart2: "\" and choose \"",
  hintPart3: "\".",
  openInBrowser: "Open in browser",
  openInSystemBrowser: "Open in system browser",
  openInDefaultBrowser: "Open in your default browser",
  openInSafari: "Open in safari",
  openInChrome: "Open in chrome",
}

const zhTW = {
  alertSentence1: "您正在使用第三方瀏覽器",
  alertSentence2: "為了享有更完整的服務，請以系統瀏覽器開啟網頁",
  hintPart1: "點擊「",
  hintPart2: "」，並選擇「",
  hintPart3: "」",
  openInBrowser: "在瀏覽器中開啟",
  openInSystemBrowser: "以瀏覽器開啟",
  openInDefaultBrowser: "使用預設瀏覽器開啟",
  openInSafari: "在 Safari 開啟",
  openInChrome: "在 Chrome 開啟",
}

export function getLocaleStrings(): any {
  const navigatorLanguage = window?.navigator.language || navigator.language;

  if (navigatorLanguage && navigatorLanguage.toLowerCase().startsWith('zh')) {
    return zhTW
  }

  return en;
}
