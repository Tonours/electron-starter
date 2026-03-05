import type { z, ZodTypeAny } from 'zod';
import { channels } from './channels';
import { PingRequestSchema, PingResponseSchema } from './schemas';

export type IpcContract<ReqSchema extends ZodTypeAny, ResSchema extends ZodTypeAny> = {
  readonly channel: string;
  readonly requestSchema: ReqSchema;
  readonly responseSchema: ResSchema;
};

const defineContract = <ReqSchema extends ZodTypeAny, ResSchema extends ZodTypeAny>(
  contract: IpcContract<ReqSchema, ResSchema>
): IpcContract<ReqSchema, ResSchema> => contract;

export const contracts = {
  ping: defineContract({
    channel: channels.ping,
    requestSchema: PingRequestSchema,
    responseSchema: PingResponseSchema
  })
} as const;

export type ContractKey = keyof typeof contracts;

export type RequestOf<K extends ContractKey> = z.input<(typeof contracts)[K]['requestSchema']>;
export type ResponseEnvelopeOf<K extends ContractKey> = z.output<(typeof contracts)[K]['responseSchema']>;
export type SuccessResponseDataOf<K extends ContractKey> = Extract<ResponseEnvelopeOf<K>, { ok: true }>['data'];
