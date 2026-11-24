const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '0.0.0.0'];

export function parseRedirectUrl(value: string): URL {
  const url = new URL(value);
  const isLocalHttp = url.protocol === 'http:' && LOCAL_HOSTNAMES.includes(url.hostname);
  if (url.username || url.password || (url.protocol !== 'https:' && !isLocalHttp)) {
    throw new Error('Invalid redirect URI');
  }
  return url;
}
