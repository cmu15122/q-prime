import {
    Divider,
    Link,
    Stack,
    Typography,
} from '@mui/material';

export default function Footer(props) {
    const { gitHubLink, theme } = props

    return (
        <Stack direction='row'
            alignItems='center'
            divider={<Divider orientation="vertical" flexItem />}
            spacing={1}
            sx={{ my: 5 }}
            justifyContent='center'
        >
            <Typography color={theme.palette.text.primary}>Created by Carnegie Mellon's 15-122 Staff Spring 2022, Sponsored by Honk</Typography>
            <Link href={gitHubLink}>Submit a queue website bug report</Link>
        </Stack>
    )
}