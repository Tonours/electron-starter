import { tv } from 'tailwind-variants';

export const container = tv({
  base: 'grid min-h-screen place-items-center bg-slate-950 px-4 text-slate-100',
});

export const card = tv({
  base: 'w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center shadow-2xl shadow-slate-950',
});

export const statusBadge = tv({
  base: 'inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm font-medium',
  variants: {
    tone: {
      idle: 'border-slate-700 bg-slate-800 text-slate-200',
      success: 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300',
      error: 'border-rose-400/30 bg-rose-500/15 text-rose-300',
    },
  },
  defaultVariants: {
    tone: 'idle',
  },
});

export const pingButton = tv({
  base: 'inline-flex items-center justify-center rounded-lg border px-4 py-2 font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
  variants: {
    loading: {
      true: 'animate-pulse',
    },
  },
  compoundVariants: [
    {
      loading: true,
      class: 'border-sky-500/30 bg-sky-500/20 text-sky-100',
    },
    {
      loading: false,
      class: 'border-sky-400/40 bg-sky-500 text-slate-950 hover:bg-sky-400',
    },
  ],
});
