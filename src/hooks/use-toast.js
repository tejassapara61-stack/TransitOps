export function useToast() {
  const toast = ({ title = '', description = '' } = {}) => {
    if (typeof window === 'undefined') return;
    const msg = [title, description].filter(Boolean).join('\n');
    if (msg) {
      window.setTimeout(() => {
        window.alert(msg);
      }, 0);
    }
  };

  return { toast };
}
