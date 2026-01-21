import { Button } from '@mui/material';

import { useAuthActions } from '@convex-dev/auth/react';

export default function GoogleLogin() {
  const { signIn } = useAuthActions();
  return (
    <Button
      color="secondary"
      variant="contained"
      sx={{ mx: 2 }}
      onClick={() => void signIn('google', { redirectTo: '/' })}
    >
      Log In
    </Button>
  );
}
