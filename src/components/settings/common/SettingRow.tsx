import { ReactNode } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';

interface SettingRowProps {
  label: string;
  description?: string;
  dirty: boolean;
  onSave: () => void | Promise<void>;
  saving?: boolean;
  status?: string | null;
  children: ReactNode;
}

export default function SettingRow({
  label,
  description,
  dirty,
  onSave,
  saving = false,
  status,
  children,
}: SettingRowProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!dirty || saving) return;
    void onSave();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          columnGap: 3,
          alignItems: 'center',
          py: 1.5,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
          {description ? (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
              {description}
            </Typography>
          ) : null}
        </Box>

        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 1 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', minWidth: 0 }}>
              {children}
            </Box>
            {dirty ? (
              <Button type="submit" variant="contained" size="small" disabled={saving}>
                Save
              </Button>
            ) : null}
          </Stack>
          {status ? (
            <Typography variant="caption" color="text.secondary">
              {status}
            </Typography>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
}
