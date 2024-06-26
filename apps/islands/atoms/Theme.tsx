// deno-lint-ignore-file ban-types
import { useEffect } from 'preact/hooks';

export const IsIsland = true;

export type ThemeProps = {};

export default function Theme(_props: ThemeProps) {
  const darkMedia = '(prefers-color-scheme: dark)';

  const setDark = () => {
    document.documentElement.classList.add('dark');

    console.log('setting dark theme');
  };

  const setLight = () => {
    document.documentElement.classList.remove('dark');

    console.log('setting light theme');
  };

  useEffect(() => {
    const isDarkTheme = !('theme' in localStorage) && matchMedia(darkMedia).matches;

    if (localStorage.theme === 'dark' || isDarkTheme) {
      setDark();
    } else {
      setLight();
    }

    matchMedia(darkMedia).addEventListener('change', ({ matches }) => {
      if (matches) {
        setDark();
      } else {
        setLight();
      }
    });
  }, []);

  return <></>;
}
