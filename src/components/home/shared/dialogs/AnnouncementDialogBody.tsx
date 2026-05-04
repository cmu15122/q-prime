import { TextField } from '@mui/material';

export default function AnnouncementDialogBody(props) {
  const { content, setContent } = props;

  return (
    <TextField
      label="Content"
      variant="outlined"
      required
      multiline
      fullWidth
      rows={4}
      defaultValue={content}
      onChange={(event) => setContent(event.target.value)}
    />
  );
}
