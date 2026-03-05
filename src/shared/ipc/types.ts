import type { SuccessResponseDataOf } from './contracts';

export interface RendererApi {
  ping: () => Promise<SuccessResponseDataOf<'ping'>>;
}
