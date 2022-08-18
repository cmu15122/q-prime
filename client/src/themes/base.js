// See https://mui.com/material-ui/customization/default-theme for customization options
import { createTheme } from '@mui/material'
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#EF8EC3',
        },
        secondary: {
            main: '#EA3947',
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
            alternatePaper: '#fff',
        },
        cancel: {
            main: '#9e9e9e',
        },
        unfreeze: {
            main: '#ba68c8',
        },
        navbar: {
            main: "#EF8EC3",
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
                root: () => ({
                    ...({
                        padding: "32px",
                    }),
                }),
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: () => ({
                    ...({
                        fontSize: "15px",
                    }),
                }),
            },
        }
    },
    typography: {
        fontSize: 15,
        htmlFontSize: 15,
        h1: {
            fontSize: 38,
        },
        h2: {
            fontSize: 34,
        },
        h3: {
            fontSize: 30,
        },
        h4: {
            fontSize: 26,
        },
        h5: {
            fontSize: 22,
        },
        h6: {
            fontSize: 18,
        },
        body1: {
            fontSize: 16,
        },
        body2: {
            fontSize: 14,
        },
        button: {
            fontSize: 14
        }
    },
});

const darkThemeTextColor = "#fff";

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#EF8EC3',
            darker: '#e36bac',
        },
        secondary: {
            main: '#e8152e',
        },
        success: {
            main: '#09e312',
        },
        error: {
            main: '#e8152e',
        },
        info: {
            main: '#5DB7DE',
        },
        background: {
            paper: '#444444',
            alternatePaper: '#575757',
            default: '#1a1919',
        },
        cancel: {
            main: '#9e9e9e',
        },
        unfreeze: {
            main: '#ba68c8',
        },
        navbar: {
            main: "#e36bac",
        }
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
                root: () => ({
                    ...({
                        padding: "32px",
                    }),
                }),
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: () => ({
                    ...({
                        fontSize: "15px",
                    }),
                }),
            },
        }
    },
    typography: {
        fontSize: 15,
        htmlFontSize: 15,
        h1: {
            fontSize: 38,
            color: darkThemeTextColor,
        },
        h2: {
            fontSize: 34,
            color: darkThemeTextColor,
        },
        h3: {
            fontSize: 30,
            color: darkThemeTextColor,
        },
        h4: {
            fontSize: 26,
            color: darkThemeTextColor,
        },
        h5: {
            fontSize: 22,
            color: darkThemeTextColor,
        },
        h6: {
            fontSize: 18,
            color: darkThemeTextColor,
        },
        body1: {
            fontSize: 16,
            color: darkThemeTextColor,
        },
        body2: {
            fontSize: 14,
            color: darkThemeTextColor,
        },
        button: {
            fontSize: 14,
            color: darkThemeTextColor,
        }
    },
});
