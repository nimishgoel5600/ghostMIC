import { useEffect } from 'react';
import { useAppStore } from '../store/app-store';

export function useKeyboardShortcuts() {
  const { qaPairs, currentSolution } = useAppStore();

  useEffect(() => {
    const handler = (action: string) => {
      switch (action) {
        case 'copyLastAnswer':
          if (qaPairs.length > 0) {
            navigator.clipboard.writeText(qaPairs[0].answer);
          }
          break;
        case 'copyLastCode':
          if (currentSolution) {
            navigator.clipboard.writeText(currentSolution.code);
          }
          break;
      }
    };

    const unsub = window.electronAPI.onShortcutTriggered(handler);
    return unsub;
  }, [qaPairs, currentSolution]);
}
