import { z } from 'zod';

export const ErrorPayloadSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  retryable: z.boolean()
});

export const ErrorEnvelopeSchema = z.object({
  ok: z.literal(false),
  error: ErrorPayloadSchema
});

export const successEnvelope = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    ok: z.literal(true),
    data: dataSchema
  });

export const responseEnvelope = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([successEnvelope(dataSchema), ErrorEnvelopeSchema]);

export const PingRequestSchema = z.object({}).strict();
export const PingDataSchema = z.object({
  message: z.literal('pong')
});
export const PingResponseSchema = responseEnvelope(PingDataSchema);

export type ErrorPayload = z.infer<typeof ErrorPayloadSchema>;
