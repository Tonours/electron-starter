export const channels = {
  ping: 'app:ping',
} as const;

export type ChannelName = (typeof channels)[keyof typeof channels];
