import React from 'react';
import {
  Divider, Link, Stack, Typography, useTheme,
} from '@mui/material';

export default function Footer(props) {
  const {gitHubLink} = props;
  const theme = useTheme();

  return (
    <Stack direction='row'
      alignItems='center'
      divider={<Divider orientation="vertical" flexItem />}
      spacing={1}
      justifyContent='center'
      sx={{py: 4}}
    >
      <Typography color={theme.palette.text.primary}>Created by Carnegie Mellon&apos;s 15-122 Staff Spring 2022, Sponsored by Honk</Typography>
      <Link href={gitHubLink} target="_blank">Submit a queue website bug report</Link>
    </Stack>
  );
}
