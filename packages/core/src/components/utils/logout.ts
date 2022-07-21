import { logout } from '../../api/auth';

export const createLogout =
  (options: { creatorUrl: string; apiKey: string; apiSecret: string }) => async (): Promise<void> => {
    const { creatorUrl, apiKey, apiSecret } = options;
    await logout({
      creatorUrl,
      apiKey,
      apiSecret,
    });
  };
