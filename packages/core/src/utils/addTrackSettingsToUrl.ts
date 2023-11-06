const { gtag } = window as any;

function getClientId(tagId: string): Promise<string> {
  return new Promise(resolve => {
    if (!gtag) resolve('');

    gtag('get', tagId, 'client_id', (clientId: string) => {
      resolve(clientId);
    });
  });
}

function getSessionId(tagId: string): Promise<string> {
  return new Promise(resolve => {
    if (!gtag) resolve('');
    gtag('get', tagId, 'session_id', (sessionId: string) => {
      resolve(sessionId);
    });
  });
}

let cachedGaTrackSettings: string[] = [];
export async function initGaTrack(measurementIds: string[]): Promise<void> {
  if (!gtag && measurementIds.length > 0) {
    console.warn('window.gtag not found, you should set up gtag in current web to use this function');
    return;
  }
  cachedGaTrackSettings = (
    await Promise.all(
      measurementIds.map(async measurementId => {
        const clientId = await getClientId(measurementId);
        const sessionId = await getSessionId(measurementId);
        if (!clientId) {
          console.error('clientId not found');
          return '';
        }
        if (!sessionId) {
          console.error('sessionId not found');
          return '';
        }
        return `${measurementId},${clientId},${sessionId}`;
      }),
    )
  ).filter(item => !!item);
}

export function addTrackSettingsToUrl(url: string): string {
  const paymentUrlObject = new URL(url);
  const params = new URLSearchParams(paymentUrlObject.search);

  // https://url?track_ga=setting1&track_ga=setting2
  cachedGaTrackSettings.forEach(each => {
    params.append('track_ga', each);
  });

  paymentUrlObject.search = params.toString();
  return paymentUrlObject.href;
}
