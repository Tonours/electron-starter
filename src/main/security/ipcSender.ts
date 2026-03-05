import { fileURLToPath } from 'node:url';
import { resolveRendererEntry } from './rendererEntry';

type SenderPolicy = {
  allowedHttpOrigins: string[];
  allowedFilePath: string | null;
};

type SenderEvent = {
  senderFrame: {
    url: string;
  } | null;
  sender: {
    getURL: () => string;
  };
};

const isAllowedHttpOrigin = (target: URL, policy: SenderPolicy): boolean => {
  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return false;
  }

  return policy.allowedHttpOrigins.includes(target.origin);
};

const isAllowedFilePath = (target: URL, policy: SenderPolicy): boolean => {
  if (target.protocol !== 'file:' || policy.allowedFilePath === null) {
    return false;
  }

  try {
    return fileURLToPath(target) === policy.allowedFilePath;
  } catch {
    return false;
  }
};

export const isTrustedRendererUrl = (
  rawUrl: string,
  policy: SenderPolicy
): boolean => {
  let target: URL;

  try {
    target = new URL(rawUrl);
  } catch {
    return false;
  }

  return (
    isAllowedHttpOrigin(target, policy) || isAllowedFilePath(target, policy)
  );
};

export const isTrustedIpcSender = (event: SenderEvent): boolean => {
  const policy = resolveRendererEntry();
  const candidateUrls = [event.senderFrame?.url, event.sender.getURL()].filter(
    (url): url is string => typeof url === 'string' && url.length > 0
  );

  return candidateUrls.some((url) => isTrustedRendererUrl(url, policy));
};
