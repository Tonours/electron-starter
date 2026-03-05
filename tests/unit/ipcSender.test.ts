import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isTrustedRendererUrl } from '@main/security/ipcSender';
import { describe, expect, it } from 'vitest';

describe('isTrustedRendererUrl', () => {
  const filePath = path.resolve('/tmp', 'renderer', 'index.html');
  const fileUrl = pathToFileURL(filePath).toString();

  it('allows trusted http origins', () => {
    const trusted = isTrustedRendererUrl('http://127.0.0.1:5173/app', {
      allowedHttpOrigins: ['http://127.0.0.1:5173'],
      allowedFilePath: null,
    });

    expect(trusted).toBe(true);
  });

  it('rejects untrusted http origins', () => {
    const trusted = isTrustedRendererUrl('http://malicious.local:3000', {
      allowedHttpOrigins: ['http://127.0.0.1:5173'],
      allowedFilePath: null,
    });

    expect(trusted).toBe(false);
  });

  it('allows the configured file path', () => {
    const trusted = isTrustedRendererUrl(fileUrl, {
      allowedHttpOrigins: [],
      allowedFilePath: filePath,
    });

    expect(trusted).toBe(true);
  });

  it('rejects invalid sender urls', () => {
    const trusted = isTrustedRendererUrl('not-an-url', {
      allowedHttpOrigins: ['http://127.0.0.1:5173'],
      allowedFilePath: filePath,
    });

    expect(trusted).toBe(false);
  });
});
