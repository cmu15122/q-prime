import { Button } from '@mui/material';

import { useAuthActions } from '@convex-dev/auth/react';

export default function GoogleLogin() {
  const { signIn } = useAuthActions();
  return (
    <Button
      color="secondary"
      variant="contained"
      sx={{ mx: 2 }}
      onClick={() => void signIn('google', { redirectTo: import.meta.env.BASE_URL || '/' })}
    >
      Log In
    </Button>
  );
}
