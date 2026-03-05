import { useState, type ReactElement } from 'react';
import { pingMain } from '@renderer/lib/api';
import { card, container, pingButton, statusBadge } from './variants';

type StatusTone = 'idle' | 'success' | 'error';

export const App = (): ReactElement => {
  const [status, setStatus] = useState<{ label: string; tone: StatusTone }>({
    label: 'Waiting',
    tone: 'idle'
  });
  const [loading, setLoading] = useState(false);

  const handlePing = async (): Promise<void> => {
    try {
      setLoading(true);
      const message = await pingMain();
      setStatus({
        label: message.toUpperCase(),
        tone: 'success'
      });
    } catch {
      setStatus({
        label: 'ERROR',
        tone: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={container()}>
      <section className={card()}>
        <h1 className="text-2xl font-bold tracking-tight">Electron Starter</h1>
        <p className={statusBadge({ tone: status.tone })}>Status: {status.label}</p>
        <button className={pingButton({ loading })} onClick={() => void handlePing()} disabled={loading}>
          {loading ? 'Loading...' : 'Ping'}
        </button>
      </section>
    </main>
  );
};
