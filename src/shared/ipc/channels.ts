export const channels = {
  ping: 'app:ping',
  preloadFatalError: 'internal:preload-fatal-error',
} as const;

export type ChannelName = (typeof channels)[keyof typeof channels];
