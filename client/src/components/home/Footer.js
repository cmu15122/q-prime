import {
    Typography,
    Stack,
    AppBar,
    Divider,
    Link,
    Box
} from '@mui/material';

export default function Footer(props) {
    const { gitHubLink } = props

    return (
        <Stack direction='row' 
            alignItems='center' 
            fullWidth 
            divider={<Divider orientation="vertical" flexItem />}
            spacing={1} 
            justifyContent='center'
        >
            <Typography>Created by Carnegie Mellon's 15-122 Staff Spring 2022, Sponsored by Honk</Typography>
            <Link href={gitHubLink}>Submit a queue website bug report</Link>
        </Stack>
    )
}