// Any code needed for theme types without the unused Theme import

// Custom theme properties
declare module '@mui/material/styles' {
    interface Theme {
        custom: {
            borderRadius: {
                small: string;
                medium: string;
                large: string;
            };
            spacing: {
                xs: string;
                sm: string;
                md: string;
                lg: string;
                xl: string;
            };
            colors: {
                primary: string;
                secondary: string;
                success: string;
                warning: string;
                error: string;
                info: string;
                background: string;
                surface: string;
                text: {
                    primary: string;
                    secondary: string;
                    disabled: string;
                };
            };
            typography: {
                fontFamily: string;
                fontSize: {
                    xs: string;
                    sm: string;
                    md: string;
                    lg: string;
                    xl: string;
                };
                fontWeight: {
                    light: number;
                    regular: number;
                    medium: number;
                    bold: number;
                };
            };
            shadows: string[];
            transitions: {
                duration: {
                    shortest: number;
                    shorter: number;
                    short: number;
                    standard: number;
                    complex: number;
                    enteringScreen: number;
                    leavingScreen: number;
                };
                easing: {
                    easeInOut: string;
                    easeOut: string;
                    easeIn: string;
                    sharp: string;
                };
            };
            zIndex: {
                mobileStepper: number;
                fab: number;
                speedDial: number;
                appBar: number;
                drawer: number;
                modal: number;
                snackbar: number;
                tooltip: number;
            };
        };
    }
    interface ThemeOptions {
        custom?: {
            borderRadius?: {
                small?: string;
                medium?: string;
                large?: string;
            };
            spacing?: {
                xs?: string;
                sm?: string;
                md?: string;
                lg?: string;
                xl?: string;
            };
            colors?: {
                primary?: string;
                secondary?: string;
                success?: string;
                warning?: string;
                error?: string;
                info?: string;
                background?: string;
                surface?: string;
                text?: {
                    primary?: string;
                    secondary?: string;
                    disabled?: string;
                };
            };
            typography?: {
                fontFamily?: string;
                fontSize?: {
                    xs?: string;
                    sm?: string;
                    md?: string;
                    lg?: string;
                    xl?: string;
                };
                fontWeight?: {
                    light?: number;
                    regular?: number;
                    medium?: number;
                    bold?: number;
                };
            };
            shadows?: string[];
            transitions?: {
                duration?: {
                    shortest?: number;
                    shorter?: number;
                    short?: number;
                    standard?: number;
                    complex?: number;
                    enteringScreen?: number;
                    leavingScreen?: number;
                };
                easing?: {
                    easeInOut?: string;
                    easeOut?: string;
                    easeIn?: string;
                    sharp?: string;
                };
            };
            zIndex?: {
                mobileStepper?: number;
                fab?: number;
                speedDial?: number;
                appBar?: number;
                drawer?: number;
                modal?: number;
                snackbar?: number;
                tooltip?: number;
            };
        };
    }
}

// Export an empty object to make this file a module
export {}; 