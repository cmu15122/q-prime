import { Button } from '@mui/material';

import { useAuthActions } from '@convex-dev/auth/react';

export default function GoogleLogin({ redirectTo }: { redirectTo?: string }) {
  const { signIn } = useAuthActions();
  const target = redirectTo ?? window.location.pathname;
  return (
    <Button
      color="secondary"
      variant="contained"
      sx={{ mx: 2 }}
      onClick={() => void signIn('google', { redirectTo: target })}
    >
      Log In
    </Button>
  );
}
