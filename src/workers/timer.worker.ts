// timer.worker.ts
// Background Web Worker for precise 1-second ticks

let intervalId: ReturnType<typeof setInterval> | null = null;

self.onmessage = (e: MessageEvent) => {
  const { command } = e.data;

  if (command === 'START') {
    if (!intervalId) {
      intervalId = setInterval(() => {
        self.postMessage({
          type: 'TICK',
          timestamp: Date.now()
        });
      }, 1000);
      // Immediate tick on start
      self.postMessage({
        type: 'TICK',
        timestamp: Date.now()
      });
    }
  } else if (command === 'STOP') {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};
