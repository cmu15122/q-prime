import { ReactNode, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useThemeContext } from './ThemeContext';
import { useCourseSlug } from './CourseContext';

function readCssVar(name: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v.length > 0 ? v : undefined;
}

/**
 * Wraps the inner course tree with a theme that has `palette.forest.main` /
 * `palette.amber.main` (and `palette.primary.main` / `palette.secondary.main`)
 * overridden by the course's custom colors, if any.
 *
 * Source of truth for course colors is the `--ohq-course-primary` /
 * `--ohq-course-secondary` CSS variables set by `index.html` from the
 * `/_theme/<slug>.css` stylesheet — which loads before React boots so the
 * landing page is already coloured correctly. We read them back into JS so
 * `useTheme().palette.forest.main` resolves to the course color in component
 * code.
 */
export function CourseAwareThemeProvider({ children }: { children: ReactNode }) {
  const { theme: baseTheme } = useThemeContext();
  const slug = useCourseSlug();

  const [coursePrimary, setCoursePrimary] = useState<string | undefined>(undefined);
  const [courseSecondary, setCourseSecondary] = useState<string | undefined>(undefined);

  useEffect(() => {
    const read = () => {
      setCoursePrimary(readCssVar('--ohq-course-primary'));
      setCourseSecondary(readCssVar('--ohq-course-secondary'));
    };
    read();
    // Re-read on next tick in case the per-course stylesheet hadn't finished
    // parsing yet (it loads async after the index.html `<link>` injection).
    const id = window.setTimeout(read, 0);
    return () => window.clearTimeout(id);
  }, [slug]);

  const theme = useMemo(() => {
    if (!coursePrimary && !courseSecondary) return baseTheme;
    return createTheme(baseTheme, {
      palette: {
        forest: {
          main: coursePrimary ?? baseTheme.palette.forest.main,
          soft: baseTheme.palette.forest.soft,
        },
        amber: {
          main: courseSecondary ?? baseTheme.palette.amber.main,
          contrastText: baseTheme.palette.amber.contrastText,
        },
        // Also override MUI's `primary`/`secondary` so default-coloured Buttons,
        // Switches, etc. pick up the course color.
        primary: {
          ...baseTheme.palette.primary,
          main: coursePrimary ?? baseTheme.palette.primary.main,
        },
        secondary: {
          ...baseTheme.palette.secondary,
          main: courseSecondary ?? baseTheme.palette.secondary.main,
        },
      },
    });
  }, [baseTheme, coursePrimary, courseSecondary]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
