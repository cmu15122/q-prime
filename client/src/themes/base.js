import { createTheme } from '@mui/material'
export const basicTheme = createTheme({
    palette: {
        type: 'light',
        primary: {
            main: '#EF8EC3',
        },
        secondary: {
            main: '#F50057',
        },
        success: {
            main: '#43a047',
        },
        error: {
            main: '#F27685',
        },
        info: {
            main: '#5DB7DE',
        },
        background: {
            paper: '#F0F0F0',
        },
        cancel: {
            main: '#9e9e9e',
        },
        unfreeze: {
            main: '#ba68c8',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    ...(ownerState.variant === 'contained' && {
                        color: '#fff',
                        padding: "5px 20px",
                    }),
                }),
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    ...({
                        padding: "32px",
                    }),
                }),
            },
        }
    }
});
