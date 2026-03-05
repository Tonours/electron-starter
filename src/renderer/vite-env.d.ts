/// <reference types="vite/client" />

import type { RendererApi } from '@shared/ipc/types';

declare global {
  interface Window {
    api: RendererApi;
  }
}
