import { useEffect, useState } from 'react';
import { CardContent, Typography, Checkbox, Stack, Button, Alert } from '@mui/material';

import BaseCard from '../../common/cards/BaseCard';

import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

/**
 * Admin toggle for the read-only SQL query module.
 * Hidden unless SQL_MODULE_ENABLED is set on the backend.
 */
export default function SqlModuleSettings() {
  const status = useQuery(api.sqlQuery.sqlQuery_get.getSqlModuleStatus);
  const updateSqlModuleEnabled = useMutation(
    api.settings.settings_mutate.updateSqlModuleEnabled,
  );

  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (status) setEnabled(status.settingEnabled);
  }, [status?.settingEnabled]);

  if (!status) return null;
  if (!status.envEnabled) return null;

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateSqlModuleEnabled({ enabled });
  };

  return (
    <BaseCard>
      <CardContent>
        <Typography sx={{ fontWeight: 'bold', mt: 1 }} variant="body1" gutterBottom>
          SQL Query Module
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          <Alert severity="info">
            This module gives admins a read-only SQL query interface over course data. The
            backend env var <code>SQL_MODULE_ENABLED</code> is currently set, so this toggle
            controls whether the module is exposed in the UI.
          </Alert>

          <form onSubmit={handleSave}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>Enable SQL Query Module:</Typography>
              <Checkbox
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <Button type="submit" variant="contained">
                Save
              </Button>
              <Typography variant="caption" color="text.secondary">
                When on, admins see an &ldquo;SQL&rdquo; tab in the navbar
              </Typography>
            </Stack>
          </form>
        </Stack>
      </CardContent>
    </BaseCard>
  );
}
