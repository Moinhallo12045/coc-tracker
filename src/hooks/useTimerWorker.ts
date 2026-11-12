import { useEffect, useState } from 'react';

export function useTimerWorker(): number {
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    let worker: Worker | null = null;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;

    try {
      worker = new Worker(new URL('../workers/timer.worker.ts', import.meta.url), {
        type: 'module'
      });

      worker.onmessage = (e: MessageEvent) => {
        if (e.data?.type === 'TICK') {
          setCurrentTimestamp(e.data.timestamp);
        }
      };

      worker.postMessage({ command: 'START' });
    } catch {
      // Fallback if Web Workers are restricted in certain environments
      fallbackInterval = setInterval(() => {
        setCurrentTimestamp(Date.now());
      }, 1000);
    }

    return () => {
      if (worker) {
        worker.postMessage({ command: 'STOP' });
        worker.terminate();
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, []);

  return currentTimestamp;
}
