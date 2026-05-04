import { Box, Link, Stack } from '@mui/material';

export default function Footer(props: { gitHubLink?: string }) {
  const { gitHubLink } = props;

  return (
    <Box
      component="footer"
      sx={(theme) => ({
        // `mt: auto` inside the parent Container's column-flex layout pushes
        // the footer to the bottom of the viewport on short pages, while still
        // letting it sit at the natural end of the scroll area on long pages.
        mt: 'auto',
        pt: 3,
        pb: 2.5,
        borderTop: `1px solid ${theme.palette.rule.default}`,
      })}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
        sx={{ px: 3 }}
      >
        <Stack direction="row" alignItems="baseline" spacing={1.5}>
          <Box
            component="span"
            sx={(theme) => ({
              display: 'inline-flex',
              alignItems: 'baseline',
              fontFamily: theme.fonts.ui,
              fontWeight: 700,
              fontSize: 14,
              lineHeight: 1,
              color: theme.palette.ink.primary,
              letterSpacing: '-0.02em',
            })}
          >
            ohq
            <Box
              component="span"
              aria-hidden
              sx={(theme) => ({
                display: 'inline-block',
                width: '0.3em',
                height: '0.3em',
                ml: '0.05em',
                borderRadius: '999px',
                background: theme.palette.forest.main,
                transform: 'translateY(-0.5em)',
              })}
            />
          </Box>
          <Box
            component="span"
            sx={(theme) => ({
              fontFamily: theme.fonts.sans,
              fontSize: 12,
              lineHeight: 1,
              color: theme.palette.ink.muted,
            })}
          >
            CMU 15-122 staff · sponsored by Honk
          </Box>
        </Stack>
        {gitHubLink && (
          <Link
            href={gitHubLink}
            target="_blank"
            rel="noopener noreferrer"
            sx={(theme) => ({
              fontFamily: theme.fonts.mono,
              fontSize: 11,
              lineHeight: 1,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: theme.palette.ink.muted,
              textDecoration: 'none',
              '&:hover': { color: theme.palette.ink.primary, textDecoration: 'underline' },
            })}
          >
            Report a bug
          </Link>
        )}
      </Stack>
    </Box>
  );
}
